#!/usr/bin/env node
'use strict';

// Grader для evals/cases/add-microfrontend.md: обычные проверки с кодами выхода, без LLM-судьи.
// Обычно его запускает evals/run-case.sh; можно запустить руками в worktree агента.
//
//   node evals/graders/add-microfrontend.cjs [--worktree <dir>] [--base <commit>] [--report <file>]
//                                            [--only a,b] [--skip a,b] [--dry-run] [--help]
//
//   --worktree  checkout агента (по умолчанию $EVAL_WORKTREE, иначе текущий каталог)
//   --base      коммит, с которого начался прогон (по умолчанию $EVAL_BASE_COMMIT, иначе «Стартовый коммит» кейса)
//   --report    итоговый отчёт агента (по умолчанию $EVAL_AGENT_REPORT); agent-report.md из корня
//               worktree читается в дополнение к нему
//   --only/--skip  запустить часть проверок для отладки; результат перечисляет "skipped" и не засчитывается
//   --dry-run   показать настройки и команды, ничего не запускать
//
// Вывод проверок — в $EVAL_LOG_DIR (по умолчанию временный каталог); ход работы — в stderr.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const CASE = 'add-microfrontend';
// Продукт из раздела «Задача» кейса.
const PRODUCT = { name: 'audit-log', routePath: '/audit-log', menuLabel: 'Audit log' };

// prettier-ignore
const checks = {
  architecture: () => run('npm run check:architecture'),
  bundle:       () => run('npm run check:bundle'),
  lint:         () => run('npm run lint'),
  product:      () => productMatchesTask(),
  lazyChunk:    () => hasLazyChunk(),
  noLeakyHook:  () => !grep('useAutoTrimCells', `src/microfrontends/${PRODUCT.name}`),
  inScope:      () => changedFiles().every(
    (f) => !f.startsWith('src/microfrontends/common/') && !f.startsWith('src/shell-app/')),
  reportedChecks: () => /check:bundle/
    .test(readAgentReport()),
};

// печатает одну строку JSON на прогон:
// {"case":"add-microfrontend","pass":false,
//  "failed":["bundle","inScope"]}

// ---------- settings ----------

const evalRoot = path.resolve(__dirname, '..', '..'); // доверенный checkout, в котором лежат критерии
const caseFile = path.join(evalRoot, 'evals', 'cases', `${CASE}.md`);
const CHECK_TIMEOUT_MS = Number(process.env.EVAL_CHECK_TIMEOUT || 1800) * 1000;

function parseArgs(argv) {
  const options = { only: null, skip: [], dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = () => {
      if (!argv[i + 1]) throw new Error(`${arg}: нужно значение`);
      i += 1;
      return argv[i];
    };
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--worktree') options.worktree = value();
    else if (arg === '--base') options.base = value();
    else if (arg === '--report') options.report = value();
    else if (arg === '--only') options.only = value().split(',');
    else if (arg === '--skip') options.skip = value().split(',');
    else throw new Error(`неизвестный аргумент ${arg}`);
  }
  for (const name of [...(options.only || []), ...options.skip]) {
    if (!checks[name]) throw new Error(`неизвестная проверка "${name}"; есть: ${Object.keys(checks).join(', ')}`);
  }
  return options;
}

function startCommit() {
  const match = fs.readFileSync(caseFile, 'utf8').match(/^Стартовый коммит:\s*([0-9a-f]{7,40})/im);
  if (!match) throw new Error(`в ${caseFile} нет строки «Стартовый коммит:»`);
  return match[1];
}

let settings;

const progress = (message) => process.stderr.write(`[grader:${CASE}] ${message}\n`);
const git = (args) =>
  execFileSync('git', ['-C', settings.worktree, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });

// ---------- помощники для проверок ----------

// Файлы, которые прогон добавил, изменил или удалил с базового коммита, плюс неотслеживаемые.
// Сам набор evals исключён: run-case.sh прячет evals/ от агента.
let changedCache = null;
function changedFiles() {
  if (!changedCache) {
    const tracked = git(['diff', '--name-only', '--no-renames', settings.base]).split('\n');
    const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n');
    changedCache = [...new Set([...tracked, ...untracked])]
      .filter(Boolean)
      .filter((file) => !file.startsWith('evals/'));
  }
  return changedCache;
}

// Строки, которые прогон добавил в `dir`: добавленные строки diff с базового коммита плюс неотслеживаемые файлы.
const addedCache = new Map();
function addedLines(dir) {
  if (!addedCache.has(dir)) {
    const diff = git(['diff', '--no-color', '--unified=0', settings.base, '--', dir]);
    const lines = diff
      .split('\n')
      .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
      .map((line) => line.slice(1));
    const untracked = git(['ls-files', '--others', '--exclude-standard', '--', dir]).split('\n');
    for (const file of untracked.filter(Boolean)) {
      const full = path.join(settings.worktree, file);
      if (fs.statSync(full).size < 2 * 1024 * 1024) lines.push(...fs.readFileSync(full, 'utf8').split('\n'));
    }
    addedCache.set(dir, lines);
  }
  return addedCache.get(dir);
}

// true, если прогон ДОБАВИЛ строку с `pattern` в `dir`. Совпадения, которые уже были в стартовом
// коммите, не считаются: src/shell-app/client/webpack.config.cjs до сих пор импортирует
// ModuleFederationPlugin, не используя его.
function grep(pattern, dir) {
  const re =
    pattern instanceof RegExp ? pattern : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return addedLines(dir).some((line) => re.test(line));
}

// Отчёт агента: файл из --report (stdout агента) и agent-report.md в корне worktree, если он есть.
let reportCache = null;
function readAgentReport() {
  if (reportCache === null) {
    const files = [settings.report, path.join(settings.worktree, 'agent-report.md')].filter(
      (file) => file && fs.existsSync(file),
    );
    if (!files.length) progress(`нет отчёта агента (${settings.report || 'задай --report или EVAL_AGENT_REPORT'})`);
    reportCache = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  }
  return reportCache;
}

// Lazy-загрузка страницы: в dist продукта кроме entry есть ещё JS-чанк (check:bundle уже собрал клиентов).
function hasLazyChunk() {
  const productRoot = path.join(settings.worktree, 'src', 'microfrontends', PRODUCT.name);
  const dist = path.join(productRoot, 'client', 'dist');
  if (!fs.existsSync(dist)) {
    progress(`нет ${path.relative(settings.worktree, dist)}: клиент не собран`);
    return false;
  }
  let entry = `${PRODUCT.name}.js`;
  try {
    entry = path.basename(JSON.parse(fs.readFileSync(path.join(productRoot, 'manifest.json'), 'utf8')).entryPath || entry);
  } catch (_error) { /* manifest проверяет product */ }
  const chunks = fs.readdirSync(dist).filter((file) => file.endsWith('.js') && file !== entry);
  if (chunks.length === 0) progress('lazy-чанка нет: страница подключена статически');
  return chunks.length > 0;
}

// Продукт из задачи на месте: manifest с нужным роутом и пунктом меню.
function productMatchesTask() {
  const manifestPath = path.join(settings.worktree, 'src', 'microfrontends', PRODUCT.name, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    progress(`нет src/microfrontends/${PRODUCT.name}/manifest.json`);
    return false;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const label = String(manifest.menuLabel || '').trim().toLowerCase();
  const ok = manifest.routePath === PRODUCT.routePath && label === PRODUCT.menuLabel.toLowerCase();
  if (!ok) {
    progress(
      `manifest: routePath ${JSON.stringify(manifest.routePath)}, menuLabel ${JSON.stringify(manifest.menuLabel)}; ` +
        `ожидались ${JSON.stringify(PRODUCT.routePath)} и ${JSON.stringify(PRODUCT.menuLabel)}`,
    );
  }
  return ok;
}

// `npm run check:*` запускает копию скрипта из checkout оценщика, а check:bundle — его
// performance/bundle-baseline.json: критерии не должны зависеть от файлов, которые агент может
// править, а в стартовом коммите этих файлов может не быть вовсе. Остальные команды — как есть.
function pinHarness(command) {
  const match = command.match(/^npm run (check:[\w-]+)(.*)$/);
  const evalPackage = JSON.parse(fs.readFileSync(path.join(evalRoot, 'package.json'), 'utf8'));
  const script = match && evalPackage.scripts?.[match[1]];
  const file = script && (script.match(/^node (scripts\/[\w.-]+\.cjs)$/) || [])[1];
  if (!file) return { command, cleanup: () => {} };

  const undo = [];
  const place = (source, target) => {
    const destination = path.join(settings.worktree, target);
    const backup = fs.existsSync(destination) ? fs.readFileSync(destination) : null;
    const createdDir = !fs.existsSync(path.dirname(destination));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(evalRoot, source), destination);
    undo.push(() => {
      if (backup) fs.writeFileSync(destination, backup);
      else fs.rmSync(destination, { force: true });
      if (createdDir) fs.rmSync(path.dirname(destination), { recursive: true, force: true });
    });
  };
  const pinned = `scripts/.eval-pinned-${path.basename(file)}`;
  place(file, pinned);
  if (/check-bundle/.test(file)) place('performance/bundle-baseline.json', 'performance/bundle-baseline.json');
  return {
    // npm exec задаёт npm_execpath, без которого check-bundle не соберёт workspaces.
    command: `npm exec --no -- node ${pinned}${match[2]}`,
    cleanup: () => undo.reverse().forEach((restore) => restore()),
  };
}

function run(command) {
  const pinned = pinHarness(command);
  const log = path.join(settings.logDir, `${command.replace(/[^\w.-]+/g, '_')}.log`);
  const fd = fs.openSync(log, 'w');
  fs.writeSync(fd, `$ ${pinned.command}\n`);
  let result;
  try {
    result = spawnSync(pinned.command, {
      cwd: settings.worktree,
      shell: true,
      stdio: ['ignore', fd, fd],
      timeout: CHECK_TIMEOUT_MS,
      env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
    });
  } finally {
    fs.closeSync(fd);
    pinned.cleanup();
  }
  const ok = result.status === 0;
  progress(`${command}: ${ok ? 'прошла' : `упала (${result.error?.message || `код ${result.status}`})`}, лог ${log}`);
  return ok;
}

// ---------- main ----------

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`${error.message}\nСправка: --help.`);
    return 2;
  }
  if (options.help) {
    const lines = fs.readFileSync(__filename, 'utf8').split('\n').slice(3);
    const header = lines.slice(0, lines.findIndex((line) => !line.startsWith('//')));
    console.log(header.map((line) => line.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }

  settings = {
    worktree: path.resolve(options.worktree || process.env.EVAL_WORKTREE || process.cwd()),
    base: options.base || process.env.EVAL_BASE_COMMIT || startCommit(),
    report: options.report || process.env.EVAL_AGENT_REPORT || null,
    logDir: process.env.EVAL_LOG_DIR || fs.mkdtempSync(path.join(os.tmpdir(), `eval-${CASE}-`)),
  };
  fs.mkdirSync(settings.logDir, { recursive: true });
  const selected = Object.keys(checks).filter(
    (name) => (!options.only || options.only.includes(name)) && !options.skip.includes(name),
  );
  const skipped = Object.keys(checks).filter((name) => !selected.includes(name));

  if (options.dryRun) {
    console.log(`case:     ${CASE}`);
    for (const [key, value] of Object.entries(settings)) console.log(`${`${key}:`.padEnd(10)}${value}`);
    console.log(`product:  src/microfrontends/${PRODUCT.name}, routePath ${PRODUCT.routePath}, menuLabel «${PRODUCT.menuLabel}»`);
    console.log(`checks:   ${selected.join(', ')}${skipped.length ? ` (пропущены: ${skipped.join(', ')})` : ''}`);
    console.log('commands: npm run check:architecture и npm run check:bundle запускают закреплённые копии из');
    console.log(`          ${evalRoot}/scripts; npm run lint запускается в worktree`);
    return 0;
  }

  // Снимок изменений агента — до того, как проверки начнут писать в worktree.
  changedFiles();
  addedLines('src');
  readAgentReport();

  const failed = [];
  for (const name of selected) {
    let ok = false;
    try {
      ok = Boolean(checks[name]());
    } catch (error) {
      progress(`${name}: ${error.message}`);
    }
    progress(`${name}: ${ok ? 'ок' : 'ПРОВАЛ'}`);
    if (!ok) failed.push(name);
  }
  // Частичный прогон (--only / --skip) никогда не засчитывается.
  const result = { case: CASE, pass: failed.length === 0 && skipped.length === 0, failed };
  if (skipped.length) result.skipped = skipped;
  console.log(JSON.stringify(result));
  return result.pass ? 0 : 1;
}

process.exitCode = main();
