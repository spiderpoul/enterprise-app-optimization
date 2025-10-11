#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const argv = require("node:process").argv.slice(2);
const METRIC = argv.includes("--parsed") ? "parsed" : "gzip"; // default gzip
const INCLUDE_DEV = argv.includes("--include-dev"); // включить *-loader, prop-types, react-is
const MIN_KB = Number((argv.find(a => a.startsWith("--minkb=")) || "").split("=")[1] || 1); // порог шума

// Твои проекты
const PROJECTS = [
  { name: "shell-app", cwd: path.resolve("src/shell-app/client"), config: "webpack.config.cjs", mode: "production" },
  { name: "operations-reports", cwd: path.resolve("src/microfrontends/operations-reports/client"), config: "webpack.config.cjs", mode: "production" },
  { name: "users-and-roles", cwd: path.resolve("src/microfrontends/users-and-roles/client"), config: "webpack.config.cjs", mode: "production" },
];

// Фильтры: что исключаем из кандидатов в externals
const PKG_DENY_PATTERNS = [
  /-loader$/i,               // любые лоадеры
  /^style-loader$/i,
  /^css-loader$/i,
  /^babel-loader$/i,
  /^mini-css-extract-plugin/i,
  /^webpack/i,
];
const PKG_DENY_EXPLICIT = [
  "prop-types",
  "react-is",
];

function shouldExcludePackage(pkg) {
  if (INCLUDE_DEV) return false;
  if (PKG_DENY_EXPLICIT.includes(pkg)) return true;
  return PKG_DENY_PATTERNS.some(rx => rx.test(pkg));
}

// --- helpers ---
function findWebpackBin(cwd) {
  try { return require.resolve("webpack/bin/webpack.js", { paths: [cwd] }); }
  catch { console.error(`❌ Не найден webpack в ${cwd}. Установи зависимости.`); process.exit(1); }
}

function runWebpack({ name, cwd, config, mode }) {
  console.log(`\n▶️  Сборка ${name} …`);
  const bin = findWebpackBin(cwd);
  const args = ["--config", config, "--profile", "--json", "--mode", mode, "--devtool", "source-map"];

  const res = spawnSync(process.execPath, [bin, ...args], { cwd, encoding: "utf8", maxBuffer: 1024 * 1024 * 1024 });
  if (res.status !== 0) {
    console.error(`❌ webpack упал для ${name}:\n${res.stderr || res.stdout}`);
    process.exit(1);
  }

  const first = res.stdout.indexOf("{");
  const last = res.stdout.lastIndexOf("}");
  const stats = JSON.parse(res.stdout.slice(first, last + 1));

  const outDir = path.resolve("dist-dup-report");
  fs.mkdirSync(outDir, { recursive: true });
  const statsPath = path.join(outDir, `${name}.stats.json`);
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`📄 ${name}: сохранён ${path.relative(process.cwd(), statsPath)}`);

  return stats;
}

function extractNpmPackageFromSourcePath(srcPath) {
  // примеры из sourcemap: webpack:///./node_modules/react/index.js
  const nmIdx = srcPath.lastIndexOf("node_modules/");
  if (nmIdx === -1) return null;
  const after = srcPath.slice(nmIdx + "node_modules/".length);
  const parts = after.split(/[\\/]/).filter(Boolean);
  if (!parts.length) return null;
  if (parts[0].startsWith("@") && parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0];
}

function listJsAssets(stats) {
  // берём итоговые js-файлы (не hot-update)
  const assets = stats.assets || [];
  return assets
    .filter(a => /\.js$/i.test(a.name) && !/hot-update/i.test(a.name))
    .map(a => a.name);
}

function resolveOutputPath(stats, cwd) {
  // webpack v5 кладёт outputPath в stats, если нет — ожидаем dist/ в конфиге
  const op = stats.outputPath ? path.resolve(stats.outputPath) : path.resolve(cwd, "dist");
  return op;
}

function tryRequireSME(cwd) {
  try {
    const p = require.resolve("source-map-explorer", { paths: [cwd, process.cwd()] });
    return require(p);
  } catch {
    return null;
  }
}

async function measurePerPackageViaSME({ name, cwd, stats }) {
  const SME = tryRequireSME(cwd);
  const outPath = resolveOutputPath(stats, cwd);
  const jsAssets = listJsAssets(stats);

  if (!SME || !jsAssets.length) {
    return null; // нет sme или ассетов — пусть фоллбэкнет
  }

  const pkgs = new Map(); // pkg -> bytes

  for (const asset of jsAssets) {
    const file = path.join(outPath, asset);
    const map = fs.existsSync(file + ".map") ? file + ".map" : null;
    if (!map) continue;

    const result = await SME.explore([file], {
      output: { format: "json" },
      onlyMapped: true,
      noRoot: true,
      gzip: METRIC === "gzip",
    });

    const fileReport = result?.results?.[0];
    const sources = fileReport?.sources || [];
    for (const s of sources) {
      const pkg = extractNpmPackageFromSourcePath(s.source);
      if (!pkg) continue;
      if (shouldExcludePackage(pkg)) continue;
      const sizeBytes = (METRIC === "gzip" ? s.gzipSize : s.size) || 0;
      if (sizeBytes <= 0) continue;

      const prev = pkgs.get(pkg) || 0;
      pkgs.set(pkg, prev + sizeBytes);
    }
  }

  return pkgs; // Map<pkg, bytes>
}

function collectPkgsFallback(stats) {
  // Фоллбэк по module.size (pre-minify), всё равно полезно для структуры дубликатов
  const pkgs = new Map();
  const mods = stats.modules || [];

  function walk(arr) {
    for (const m of arr) {
      if (Array.isArray(m.modules) && m.modules.length) { walk(m.modules); continue; }
      const id = m.nameForCondition || m.name || m.identifier || "";
      const pkg = extractNpmPackageFromSourcePath(id);
      if (!pkg) continue;
      if (shouldExcludePackage(pkg)) continue;
      const size = typeof m.size === "number" ? m.size : 0;
      const prev = pkgs.get(pkg) || 0;
      pkgs.set(pkg, prev + size);
    }
  }
  walk(mods);
  return pkgs;
}

function toKB(b) { return +(b / 1024).toFixed(1); }

(async function main() {
  const results = [];

  for (const proj of PROJECTS) {
    const stats = runWebpack(proj);
    const pkgsSME = await measurePerPackageViaSME({ ...proj, stats });
    const pkgs = pkgsSME || collectPkgsFallback(stats);

    // отсечём шум
    for (const [k, v] of pkgs) {
      if (toKB(v) < MIN_KB) pkgs.delete(k);
    }

    results.push({ name: proj.name, pkgs, usedMetric: pkgsSME ? METRIC : "stat" });
  }

  // собрать сводку по пакетам
  const allNames = new Set(results.flatMap(r => Array.from(r.pkgs.keys())));
  const rows = [];
  for (const pkg of allNames) {
    const perApp = {};
    let apps = 0;
    let total = 0;
    for (const r of results) {
      const size = r.pkgs.get(pkg) || 0;
      if (size > 0) {
        perApp[r.name] = size;
        total += size;
        apps += 1;
      }
    }
    if (apps >= 2) {
      const maxOne = Math.max(...Object.values(perApp));
      rows.push({
        pkg,
        perApp,
        total,
        save: total - maxOne,
      });
    }
  }
  rows.sort((a, b) => b.save - a.save);

  // вывод
  const metricLabel = (() => {
    const anyFallback = results.some(r => r.usedMetric === "stat");
    if (anyFallback) return "KB (parsed/gzip если доступно, иначе stat)";
    return METRIC === "gzip" ? "KB (gzip)" : "KB (parsed)";
  })();

  console.log(`\n=== Дубликаты (кандидаты в externals), отсортировано по потенциальной экономии — ${metricLabel} ===`);
  const header =
    `${"package".padEnd(36)} | ` +
    results.map(r => r.name.padEnd(18)).join(" | ") +
    ` | ${"total".padEnd(10)} | ${"save".padEnd(10)}`;
  console.log(header);
  console.log("-".repeat(header.length));

  for (const row of rows) {
    const perCols = results.map(r => String(toKB(row.perApp[r.name] || 0)).padStart(6).padEnd(18)).join(" | ");
    console.log(
      row.pkg.padEnd(36) + " | " + perCols + " | " + String(toKB(row.total)).padEnd(10) + " | " + String(toKB(row.save)).padEnd(10)
    );
  }

  // сохранение отчётов
  const outDir = path.resolve("dist-dup-report");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "duplicates.v2.json"),
    JSON.stringify({
      metric: metricLabel,
      apps: results.map(r => ({ name: r.name, metric: r.usedMetric })),
      rows: rows.map(r => ({
        package: r.pkg,
        perAppKB: Object.fromEntries(Object.entries(r.perApp).map(([k, v]) => [k, toKB(v)])),
        totalKB: toKB(r.total),
        potentialSaveKB: toKB(r.save),
      })),
    }, null, 2)
  );

  const csvHeader = [
    "package",
    ...results.map(r => `${r.name}_KB`),
    "total_KB",
    "potential_save_KB",
  ].join(",");

  const csvRows = rows.map(r => {
    const cols = results.map(x => toKB(r.perApp[x.name] || 0).toFixed(1));
    return [JSON.stringify(r.pkg), ...cols, toKB(r.total).toFixed(1), toKB(r.save).toFixed(1)].join(",");
  });
  fs.writeFileSync(path.join(outDir, "duplicates.v2.csv"), [csvHeader, ...csvRows].join("\n"));

  console.log(`\n✅ Готово. Отчёты: ${path.relative(process.cwd(), outDir)}/duplicates.v2.(json|csv)\n`);
  console.log(`ℹ️ Подсказка: по умолчанию исключены дев-рантаймы и prop-types/react-is. Для полного списка добавь флаг --include-dev.`);
})();
