#!/usr/bin/env node
'use strict';

// Снимает метрики готового прогона демо одной меркой — одинаково для Run A (demo-before) и Run B
// (demo/agent-ready-v2). Лежит в main, поэтому есть в обеих ветках. Запускается спикером в клоне агента,
// когда агент закончил: код агента не меняет, только пишет agent-metrics.* в корень клона.
// Для агента это не проверка качества: до конца прогона docs/demo/ от него спрятан (docs/demo/report-prompt.md),
// а в Run A MCP агенту не подключён. Браузер — тот же Chrome DevTools MCP, что у check:web-vitals в Run B.
//
//   node docs/demo/measure-run.cjs [--worktree <клон>] [--base <коммит>] [--label "Run A"]
//                                  [--route /application-security] [--compare /users,/reports]
//                                  [--skip-build] [--no-browser] [--no-dev] [--memory]
//
//   --worktree   клон агента (по умолчанию — репозиторий, в котором лежит скрипт)
//   --base       коммит, с которого стартовал прогон (по умолчанию — upstream ветки, иначе HEAD)
//   --label      подпись прогона (по умолчанию Run A для demo-before, Run B для demo/agent-ready-v2)
//   --route      роут новой страницы (по умолчанию /application-security)
//   --compare    ещё роуты для сравнения LCP, через запятую
//   --skip-build не запускать npm run build (dist уже собран)
//   --no-browser не поднимать приложение и не открывать Chrome (только git, код и dist)
//   --no-dev     не проверять npm run dev (по умолчанию проверяем: открывается ли страница в dev)
//   --memory     дополнительно прогнать сценарий памяти tests/memlab/application-security.scenario.js
//   --product    имя продукта вместо application-security (только для самопроверки скрипта)
//
// Chrome в контейнере под root: WEB_VITALS_MCP_ARGS="--executablePath <chrome> --chromeArg=--no-sandbox".
// Порты 4300–4405 должны быть свободны: останови npm run dev и приложение, которое поднимал агент.
//
// Результат в корне клона: agent-metrics.md (вставляется в раздел 10 отчёта), agent-metrics.json,
// скриншоты agent-metrics-*.png, логи agent-metrics-build.log и agent-metrics-dev.log.

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execFileSync } = require('child_process');

// Снимок окружения до чтения webpack-конфигов: общий helper вызывает dotenv.config() с .env продукта,
// и без снимка все запущенные серверы унаследовали бы его порты и столкнулись бы друг с другом.
const cleanEnv = { ...process.env };

const toolRoot = path.resolve(__dirname, '..', '..');
// Тот же сервер, что в .mcp.json / opencode.json ветки demo/agent-ready-v2: Chrome без UI, чистый профиль,
// без CrUX и статистики. Версия закреплена в devDependencies main, поэтому npx --no-install есть в обоих клонах.
const MCP_SERVER = {
  command: 'npx',
  args: ['--no-install', 'chrome-devtools-mcp', '--headless', '--isolated', '--viewport=1440x900', '--no-usage-statistics', '--no-performance-crux'],
};
// Те же условия, что у check:web-vitals: CPU ×4, медиана трёх прогонов с холодным кешем.
const CPU_THROTTLING = 4;
const RUNS = 3;
let PRODUCT = 'application-security';
const CONTRACT = {
  id: 'application-security-microfrontend',
  routePath: '/application-security',
  entryPath: '/application-security.js',
  apiPrefix: '/api/mf/application-security',
  menuLabel: 'Application Security',
};

// ---------- аргументы ----------
const options = { route: CONTRACT.routePath, compare: [], build: true, browser: true, dev: true, memory: false };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  const value = () => {
    if (argv[i + 1] === undefined) throw new Error(`${arg}: нужно значение`);
    i += 1;
    return argv[i];
  };
  if (arg === '--worktree') options.worktree = value();
  else if (arg === '--base') options.base = value();
  else if (arg === '--label') options.label = value();
  else if (arg === '--route') options.route = value();
  else if (arg === '--compare') options.compare = value().split(',').map((s) => s.trim()).filter(Boolean);
  else if (arg === '--skip-build') options.build = false;
  else if (arg === '--no-browser') options.browser = false;
  else if (arg === '--memory') options.memory = true;
  else if (arg === '--no-dev') options.dev = false;
  else if (arg === '--product') PRODUCT = value();
  else if (arg === '--help' || arg === '-h') {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(3, 28).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    process.exit(0);
  } else throw new Error(`неизвестный аргумент ${arg}; --help покажет параметры`);
}
const wt = path.resolve(options.worktree || toolRoot);
if (!fs.existsSync(path.join(wt, 'package.json'))) {
  console.error(`${wt}: это не корень репозитория (нет package.json).`);
  process.exit(2);
}
const log = (message) => console.error(`[measure-run] ${message}`);

// ---------- утилиты ----------
const gitRaw = (...args) => execFileSync('git', ['-C', wt, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const git = (...args) => gitRaw(...args).trim();
const exists = (...parts) => fs.existsSync(path.join(wt, ...parts));
const read = (...parts) => (exists(...parts) ? fs.readFileSync(path.join(wt, ...parts), 'utf8') : '');
const readJson = (...parts) => {
  try {
    return JSON.parse(read(...parts));
  } catch {
    return null;
  }
};
const walk = (dir, skip = ['node_modules', 'dist', '.nx']) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (skip.includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, skip) : [full];
  });
};
const count = (text, re) => (text.match(re) || []).length;
const mb = (bytes) => (bytes === null || bytes === undefined ? '—' : `${(bytes / 1024 / 1024).toFixed(2).replace('.', ',')} МБ`);
const kb = (bytes) => (bytes === null || bytes === undefined ? '—' : `${Math.round(bytes / 1024)} КБ`);
const ms = (value) => (value === null || value === undefined ? '—' : `${Math.round(value).toLocaleString('ru-RU')} мс`);
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const yesNo = (v) => (v ? 'да' : 'нет');
const rel = (file) => path.relative(wt, file).split(path.sep).join('/');
const parseEnv = (file) =>
  Object.fromEntries(
    read(file)
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]),
  );

const metrics = { worktree: wt, measuredAt: new Date().toISOString(), tool: 'docs/demo/measure-run.cjs' };
const cleanups = [];
const cleanup = () => {
  for (const fn of cleanups.splice(0)) {
    try {
      fn();
    } catch {
      /* уже завершено */
    }
  }
};
process.on('exit', cleanup);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(130));

// ---------- 1. git: что изменил агент ----------
log('git: изменённые файлы');
const tryGit = (...args) => {
  try {
    return git(...args);
  } catch {
    return null;
  }
};
const branch = tryGit('rev-parse', '--abbrev-ref', 'HEAD') || '';
const label =
  options.label ||
  (/demo-before/.test(branch) ? 'Run A (demo-before)' : /agent-ready/.test(branch) ? 'Run B (demo/agent-ready-v2)' : branch || path.basename(wt));
metrics.label = label;
const head = git('rev-parse', 'HEAD');
let base = head;
let baseRef = 'HEAD';
if (options.base) {
  base = git('rev-parse', '--verify', `${options.base}^{commit}`);
  baseRef = options.base;
} else if (tryGit('rev-parse', '--verify', '-q', '@{upstream}')) {
  // Если агент коммитил, его коммиты тоже считаются изменениями прогона.
  base = git('merge-base', 'HEAD', '@{upstream}');
  baseRef = tryGit('rev-parse', '--abbrev-ref', '@{upstream}') || 'upstream';
}
metrics.git = { branch, head: head.slice(0, 7), base: base.slice(0, 7), baseRef };

const files = new Map(); // path -> status
for (const line of gitRaw('status', '--porcelain=v1', '--untracked-files=all').split('\n').filter(Boolean)) {
  const status = line.slice(0, 2).trim() || '??';
  const file = line.slice(3).replace(/^"|"$/g, '');
  files.set(file, status);
}
if (base !== head) {
  for (const line of git('diff', '--name-status', base, head).split('\n').filter(Boolean)) {
    const [status, file] = line.split('\t');
    if (!files.has(file)) files.set(file, status);
  }
}
const ownFiles = ['agent-report.md', 'agent-metrics.md', 'agent-metrics.json', 'agent-metrics-build.log', 'agent-metrics-dev.log'];
const zoneOf = (file) => {
  if (ownFiles.includes(file) || /^agent-metrics-.*\.png$/.test(file)) return 'отчёт и метрики (не считаем)';
  if (file.startsWith(`src/microfrontends/${PRODUCT}/`)) return 'свой продукт';
  if (['nx.json', 'package.json', 'package-lock.json'].includes(file)) return 'регистрация (nx.json, workspaces)';
  if (file.startsWith('src/microfrontends/common/')) return 'ОБЩИЙ КОД common/ (вне scope)';
  if (file.startsWith('src/shell-app/')) return 'SHELL (вне scope)';
  if (file.startsWith('src/microfrontends/')) return 'ДРУГОЙ ПРОДУКТ (вне scope)';
  if (file.startsWith('scripts/') || file.startsWith('performance/') || file.startsWith('.github/')) return 'ПРОВЕРКИ И BASELINE';
  if (file.startsWith('tests/memlab/')) return 'сценарии памяти';
  if (/^(AGENTS\.md|docs\/|\.agents\/|\.opencode\/|openspec\/|evals\/|\.mcp\.json|opencode\.json|babel\.config\.cjs)/.test(file)) return 'HARNESS и корневые конфиги';
  return 'прочее';
};
const zones = {};
for (const [file, status] of files) (zones[zoneOf(file)] ||= []).push(`${status} ${file}`);
metrics.git.files = Object.fromEntries(Object.entries(zones).map(([zone, list]) => [zone, list.sort()]));
metrics.git.outOfScope = Object.entries(zones)
  .filter(([zone]) => /вне scope|ПРОВЕРКИ|HARNESS|прочее/.test(zone))
  .flatMap(([, list]) => list);

// ---------- 2. код продукта ----------
log('код: продукт, manifest, Babel, webpack, хуки');
const productDir = path.join(wt, 'src', 'microfrontends', PRODUCT);
const code = { exists: fs.existsSync(productDir) };
metrics.code = code;
if (code.exists) {
  const manifest = readJson('src', 'microfrontends', PRODUCT, 'manifest.json');
  code.manifest = manifest;
  code.contract = manifest
    ? {
        id: manifest.id === CONTRACT.id,
        routePath: manifest.routePath === CONTRACT.routePath,
        entryPath: manifest.entryPath === CONTRACT.entryPath,
        apiPrefix: manifest.api?.prefix === CONTRACT.apiPrefix,
        menuLabel: manifest.menuLabel === CONTRACT.menuLabel,
      }
    : null;
  const nx = readJson('nx.json') || {};
  const rootPackage = readJson('package.json') || {};
  code.registered = {
    nxClient: nx.projects?.[`${PRODUCT}-client`] === `src/microfrontends/${PRODUCT}/client`,
    nxServer: nx.projects?.[`${PRODUCT}-server`] === `src/microfrontends/${PRODUCT}/server`,
    workspaceClient: (rootPackage.workspaces || []).includes(`src/microfrontends/${PRODUCT}/client`),
    workspaceServer: (rootPackage.workspaces || []).includes(`src/microfrontends/${PRODUCT}/server`),
  };

  const clientSources = walk(path.join(productDir, 'client')).filter((f) => /\.(?:tsx?|jsx?|mjs)$/.test(f));
  const sourceText = clientSources.map((f) => fs.readFileSync(f, 'utf8'));
  const perFile = (re) => clientSources.filter((f, i) => re.test(sourceText[i])).map(rel);
  code.client = {
    files: clientSources.length,
    require: sourceText.reduce((n, t) => n + count(t, /\brequire\(/g), 0),
    requireFiles: perFile(/\brequire\(/),
    moduleExports: sourceText.reduce((n, t) => n + count(t, /\bmodule\.exports\b/g), 0),
    dynamicImport: sourceText.reduce((n, t) => n + count(t, /\bimport\(/g), 0),
    reactLazy: sourceText.reduce((n, t) => n + count(t, /\b(?:React\.)?lazy\(/g), 0),
    suspense: sourceText.some((t) => /<Suspense\b/.test(t)),
    useMemo: sourceText.reduce((n, t) => n + count(t, /\buseMemo\(/g), 0),
    useCallback: sourceText.reduce((n, t) => n + count(t, /\buseCallback\(/g), 0),
    reactMemo: sourceText.reduce((n, t) => n + count(t, /\b(?:React\.)?memo\(/g), 0),
    useAutoTrimCells: perFile(/useAutoTrimCells/),
    moduleLevelMap: perFile(/^const\s+\w+\s*=\s*new\s+(?:Map|Set|WeakMap)\b/m),
    // Компоненты, объявленные внутри другого компонента: const/function с заглавной буквы с отступом.
    nestedComponents: sourceText.reduce(
      (n, t) => n + count(t, /^[ \t]{2,}(?:const|function)\s+[A-Z]\w*\s*(?:=\s*(?:\([^)]*\)|\w+)\s*=>|\()/gm),
      0,
    ),
    antdWholeImport: sourceText.some((t) => /from\s+['"]antd['"]/.test(t)),
  };
  const babel = read('src', 'microfrontends', PRODUCT, 'client', 'babel.config.cjs');
  const modules = babel.match(/modules\s*:\s*(['"]?)([\w-]+)\1/);
  code.babel = {
    exists: Boolean(babel),
    reexportsRoot: /require\(\s*['"][./]*babel\.config\.cjs['"]\s*\)/.test(babel),
    modules: modules ? modules[2] : babel ? 'не задан' : null,
  };
  const webpack = read('src', 'microfrontends', PRODUCT, 'client', 'webpack.config.cjs');
  const publicPath = webpack.match(/publicPath\s*[:=]\s*(['"`])([^'"`]*)\1/);
  const chunkFilename = webpack.match(/chunkFilename\s*[:=]\s*(['"`])([^'"`]*)\1/);
  code.webpack = {
    exists: Boolean(webpack),
    usesCommonHelper: webpack.includes('createMicrofrontendConfig'),
    publicPath: publicPath ? publicPath[2] : webpack ? '/ (по умолчанию из helper)' : null,
    chunkFilename: chunkFilename ? chunkFilename[2] : null,
    moduleFederation: /ModuleFederationPlugin/.test(webpack),
  };
  const serverSources = walk(path.join(productDir, 'server')).filter((f) => /\.(?:[cm]?js|ts)$/.test(f));
  const serverText = serverSources.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  code.server = {
    files: serverSources.length,
    usesCommonBootstrap: /common\/bootstrap/.test(serverText) || /common\/server/.test(serverText),
    corsAny: /origin\s*:\s*['"]\*['"]|Access-Control-Allow-Origin['"]?\s*,\s*['"]\*/.test(serverText),
    servesAssets: /\/api\/assets/.test(serverText),
  };
}
const shellSources = walk(path.join(wt, 'src', 'shell-app', 'client')).filter((f) => /\.(?:tsx?|jsx?)$/.test(f));
code.pageCodeInShell = shellSources
  .filter((f) => /application-security|ApplicationSecurity/i.test(fs.readFileSync(f, 'utf8')))
  .map(rel);
{
  const envFile = path.join(productDir, '.env');
  const env = fs.existsSync(envFile) ? require('dotenv').parse(fs.readFileSync(envFile, 'utf8')) : null;
  const scripts = (readJson('package.json') || {}).scripts || {};
  const inScript = (scriptName, project) => new RegExp(`(?:--projects[= ]|,)${project}(?:,|\\s|$)`).test(scripts[scriptName] || '');
  code.localRun = {
    env: env ? { MICROFRONT_PORT: env.MICROFRONT_PORT || null, CLIENT_PORT: env.CLIENT_PORT || null } : null,
    inDev: inScript('dev', `${PRODUCT}-client`) && inScript('dev', `${PRODUCT}-server`),
    inDevProd: inScript('dev:prod', `${PRODUCT}-client`),
    inBuildProdRun: inScript('build:prod:run', `${PRODUCT}-server`),
  };
  // Порты всех продуктов и shell: совпадение значит, что в npm run dev один из процессов не встанет.
  const owners = {};
  const addPort = (port, owner) => port && (owners[port] ||= []).push(owner);
  const shellEnv = parseEnv('src/shell-app/.env');
  addPort(shellEnv.SHELL_PORT, 'shell (SHELL_PORT)');
  addPort(shellEnv.CLIENT_PORT, 'shell (CLIENT_PORT)');
  for (const name of fs.existsSync(path.join(wt, 'src', 'microfrontends')) ? fs.readdirSync(path.join(wt, 'src', 'microfrontends')) : []) {
    if (name === 'common' || !exists('src', 'microfrontends', name, '.env')) continue;
    const productEnv = parseEnv(`src/microfrontends/${name}/.env`);
    addPort(productEnv.MICROFRONT_PORT, `${name} (MICROFRONT_PORT)`);
    addPort(productEnv.CLIENT_PORT, `${name} (CLIENT_PORT)`);
  }
  code.localRun.portConflicts = Object.entries(owners)
    .filter(([, list]) => list.length > 1 && list.some((owner) => owner.startsWith(`${PRODUCT} `)))
    .map(([port, list]) => `${port}: ${list.join(', ')}`);
  const webpackFile = path.join(productDir, 'client', 'webpack.config.cjs');
  try {
    process.env.ANALYZE = 'false';
    const exported = fs.existsSync(webpackFile) ? require(webpackFile) : null;
    const evaluated = typeof exported === 'function' ? exported({}, { mode: 'development' }) : exported;
    code.localRun.devEntryPublicPath = evaluated ? (evaluated.devServer?.devMiddleware?.publicPath ?? evaluated.output?.publicPath ?? '/') : null;
  } catch (error) {
    code.localRun.devEntryPublicPath = `ошибка: ${error.message}`;
  }
}
code.memlabScenario = {
  exists: exists('tests', 'memlab', `${PRODUCT}.scenario.js`),
  usesHelper: /create-route-pagination-scenario/.test(read('tests', 'memlab', `${PRODUCT}.scenario.js`)),
};

// ---------- 3. отчёт агента ----------
const report = read('agent-report.md');
const mentions = (re) => re.test(report);
metrics.report = {
  exists: Boolean(report),
  chars: report.length,
  checksMentioned: Object.fromEntries(
    Object.entries({
      'check:ai': /check:ai/,
      'check:architecture': /check:architecture/,
      'check:bundle': /check:bundle/,
      'check:memory': /check:memory|memlab/i,
      'check:web-vitals': /check:web-vitals|web vitals|LCP/i,
      'npm run lint': /npm run lint|eslint/i,
      'npm run build': /npm run build|сборк/i,
      'validate:microfrontends': /validate:microfrontends/,
      'start:prod / приложение поднято': /start:prod|localhost:4300/,
      'MCP chrome-devtools': /chrome-devtools|MCP/i,
    }).map(([name, re]) => [name, mentions(re)]),
  ),
  harnessMentioned: Object.fromEntries(
    Object.entries({
      explorer: /explorer/i,
      reviewer: /\breviewer\b/i,
      'log-analyst': /log-analyst/i,
      'safe-change': /safe-change/,
      'performance-check': /performance-check/,
      'web-vitals-check': /web-vitals-check/,
      'page-generator': /page-generator/,
      'do-everything': /do-everything/,
      'frontend-helper': /frontend-helper/,
    }).map(([name, re]) => [name, mentions(re)]),
  ),
  saysDone: /готов/i.test(report),
};

// ---------- 4. сборка и dist ----------
const dist = {};
metrics.build = { ran: options.build };
if (options.build) {
  log('сборка: npm run build в worktree (несколько минут)');
  const started = Date.now();
  const result = spawnSync('npm', ['run', 'build'], { cwd: wt, encoding: 'utf8', env: { ...cleanEnv, NODE_ENV: 'production' }, maxBuffer: 64 * 1024 * 1024 });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  fs.writeFileSync(path.join(wt, 'agent-metrics-build.log'), output);
  metrics.build.exitCode = result.status;
  metrics.build.seconds = Math.round((Date.now() - started) / 1000);
  metrics.build.tail = output.trim().split('\n').slice(-6);
  log(`сборка завершилась с кодом ${result.status} за ${metrics.build.seconds} с`);
}
const sizeOf = (file) => (fs.existsSync(file) ? fs.statSync(file).size : null);
const jsIn = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.js')) : []);
const shellAssets = path.join(wt, 'src', 'shell-app', 'client', 'dist', 'assets');
const shellMain = jsIn(shellAssets).find((f) => /^main\..+\.js$/.test(f));
dist.shellMain = shellMain ? { name: shellMain, bytes: sizeOf(path.join(shellAssets, shellMain)) } : null;
dist.products = {};
for (const name of fs.existsSync(path.join(wt, 'src', 'microfrontends')) ? fs.readdirSync(path.join(wt, 'src', 'microfrontends')) : []) {
  const manifest = readJson('src', 'microfrontends', name, 'manifest.json');
  if (!manifest) continue;
  const distDir = path.join(wt, 'src', 'microfrontends', name, 'client', 'dist');
  const entryFile = path.basename(manifest.entryPath || `${name}.js`);
  dist.products[name] = {
    entry: entryFile,
    entryBytes: sizeOf(path.join(distDir, entryFile)),
    lazyChunks: jsIn(distDir)
      .filter((f) => f !== entryFile)
      .map((f) => ({ name: f, bytes: sizeOf(path.join(distDir, f)) })),
  };
}
metrics.dist = dist;

// ---------- 5. приложение и браузер ----------
async function fetchInfo(url, timeoutMs = 60000) {
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });
    const body = Buffer.from(await response.arrayBuffer());
    return {
      status: response.status,
      contentType: (response.headers.get('content-type') || '').split(';')[0],
      bytes: body.length,
      looksLikeHtml: /^\s*<!doctype html|<html/i.test(body.subarray(0, 200).toString()),
    };
  } catch (error) {
    return { error: error.message };
  }
}

const sleep = (msValue) => new Promise((resolve) => setTimeout(resolve, msValue));
const waitFor = async (check, timeoutMs) => {
  for (const startedAt = Date.now(); Date.now() - startedAt < timeoutMs; ) {
    if (await check().catch(() => false)) return true;
    await sleep(1000);
  }
  return false;
};
const shellUrl = `http://localhost:${parseEnv('src/shell-app/.env').SHELL_PORT || '4300'}`;
const shellResponds = () => fetch(`${shellUrl}/api/microfrontends`, { signal: AbortSignal.timeout(3000) }).then((r) => r.ok);
const productList = () =>
  Object.keys(dist.products).map((name) => ({
    name,
    id: readJson('src', 'microfrontends', name, 'manifest.json')?.id,
    port: parseEnv(`src/microfrontends/${name}/.env`).MICROFRONT_PORT,
    dir: path.join(wt, 'src', 'microfrontends', name),
  }));
const killGroup = (child, signal = 'SIGTERM') => {
  try {
    process.kill(-child.pid, signal);
  } catch {
    /* уже завершился */
  }
};
const parseJsonOutput = (text) => JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
const consoleProblems = (text) =>
  text
    .split('\n')
    .filter((line) => /error|404|504|failed/i.test(line))
    .map((line) => line.trim())
    .slice(0, 8);

// Тот же замер, что у check:web-vitals в demo/agent-ready-v2: ждёт, пока сеть и LCP затихнут, возвращает LCP, CLS и JS до LCP.
const measureInPage = `async () => {
  const lcpEntries = [];
  const shifts = [];
  new PerformanceObserver((list) => lcpEntries.push(...list.getEntries())).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((list) => shifts.push(...list.getEntries())).observe({ type: 'layout-shift', buffered: true });
  let state = '';
  let quietSince = performance.now();
  while (performance.now() < 45000) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const next = lcpEntries.length + ':' + performance.getEntriesByType('resource').length;
    if (next !== state) {
      state = next;
      quietSince = performance.now();
    } else if (lcpEntries.length > 0 && performance.now() - quietSince > 3000) {
      break;
    }
  }
  const lcp = lcpEntries[lcpEntries.length - 1];
  let cls = 0;
  let windowValue = 0;
  let windowStart = 0;
  let previous = 0;
  for (const shift of shifts.filter((entry) => !entry.hadRecentInput)) {
    if (shift.startTime - previous > 1000 || shift.startTime - windowStart > 5000) {
      windowValue = 0;
      windowStart = shift.startTime;
    }
    windowValue += shift.value;
    previous = shift.startTime;
    cls = Math.max(cls, windowValue);
  }
  const scripts = performance.getEntriesByType('resource')
    .filter((entry) => /\\.m?js(\\?|$)/.test(entry.name) && (!lcp || entry.startTime < lcp.startTime))
    .map((entry) => ({ name: entry.name.split('/').pop(), bytes: entry.encodedBodySize }))
    .sort((a, b) => b.bytes - a.bytes);
  return {
    lcp: lcp ? Math.round(lcp.startTime) : null,
    lcpElement: lcp && lcp.element ? lcp.element.tagName.toLowerCase() + (lcp.element.className ? '.' + String(lcp.element.className).split(' ')[0] : '') : null,
    cls: Math.round(cls * 1000) / 1000,
    scripts: scripts.slice(0, 3),
    scriptBytes: scripts.reduce((sum, entry) => sum + entry.bytes, 0),
  };
}`;

const renderInPage = `() => {
  const text = document.body.innerText || '';
  return {
    path: location.pathname,
    menuBuilt: document.querySelectorAll('[data-testid$="-microfrontend"]').length > 0,
    menuItem: !!document.querySelector('[data-testid="${CONTRACT.id}"]'),
    table: !!document.querySelector('table, .ant-table, [role="table"]'),
    rows: document.querySelectorAll('tbody tr').length,
    pagination: !!document.querySelector('.ant-pagination, [class*="pagination"], [data-test*="pagination"]'),
    notFound: /not found/i.test(text),
    errorShown: /повторить|retry|ошибк|failed|error/i.test(text),
    unavailableWarning: /недоступ|unavailable/i.test(text),
    bodyChars: text.length,
  };
}`;

async function openBrowser() {
  const sdk = (name) => require(require.resolve(`@modelcontextprotocol/sdk/client/${name}.js`, { paths: [wt, toolRoot] }));
  const { Client } = sdk('index');
  const { StdioClientTransport } = sdk('stdio');
  const extraArgs = (process.env.WEB_VITALS_MCP_ARGS || '').split(' ').filter(Boolean);
  const cwd = fs.existsSync(path.join(wt, 'node_modules', 'chrome-devtools-mcp')) ? wt : toolRoot;
  const client = new Client({ name: 'measure-run', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: MCP_SERVER.command, args: [...MCP_SERVER.args, ...extraArgs], cwd, stderr: 'ignore' });
  cleanups.push(() => transport.close());
  await client.connect(transport);
  const call = async (name, args) => {
    if (process.env.MEASURE_VERBOSE) log(`mcp ${name}`);
    const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 240000 });
    const text = result.content.map((part) => part.text || '').join('\n');
    if (result.isError) throw new Error(`${name}: ${text}`);
    return { text, content: result.content };
  };
  return { call, close: () => client.close() };
}

async function screenshot(call, file) {
  try {
    const shot = await call('take_screenshot', { pageId: 1, format: 'png' });
    const image = shot.content.find((part) => part.type === 'image');
    if (!image) return null;
    fs.writeFileSync(path.join(wt, file), Buffer.from(image.data, 'base64'));
    return file;
  } catch (error) {
    log(`скриншот ${file} не снят: ${error.message}`);
    return null;
  }
}

// ---------- 5a. как в production: shell и продукты из dist ----------
async function runProd(browser) {
  const app = { shellUrl, products: {} };
  const children = [];
  const start = (name, cwd, extraEnv) => {
    const child = spawn('npm', ['run', 'start:dist'], {
      cwd,
      env: { ...cleanEnv, NODE_ENV: 'production', ...extraEnv },
      stdio: 'ignore',
      detached: true,
    });
    child.on('exit', (exitCode) => {
      if (exitCode) {
        log(`${name} завершился с кодом ${exitCode}: порт занят или нет dist`);
        (app.startupErrors ||= []).push(`${name}: код выхода ${exitCode} (порт занят или нет dist)`);
      }
    });
    children.push(child);
  };
  const stop = () => children.forEach((child) => killGroup(child));
  cleanups.push(() => children.forEach((child) => killGroup(child, 'SIGKILL')));

  const products = productList();
  log(`production: shell ${shellUrl} и продукты ${products.map((p) => p.name).join(', ')}`);
  start('shell', path.join(wt, 'src', 'shell-app', 'server'));
  if (!(await waitFor(shellResponds, 60000))) {
    app.error = `shell не ответил на ${shellUrl} за минуту`;
    stop();
    return app;
  }
  for (const product of products) {
    if (!product.port) {
      app.products[product.name] = { error: 'нет .env с MICROFRONT_PORT — сервер продукта не на чем поднять' };
      continue;
    }
    start(product.name, path.join(product.dir, 'server'), { MICROFRONT_PUBLIC_URL: `http://localhost:${product.port}` });
  }
  const expected = products.filter((p) => p.port);
  app.allRegistered = await waitFor(async () => {
    const registry = await fetch(`${shellUrl}/api/microfrontends`).then((r) => r.json());
    return expected.every((p) => registry.some((entry) => entry.id === p.id));
  }, 90000);
  const registry = await fetch(`${shellUrl}/api/microfrontends`).then((r) => r.json()).catch(() => []);
  for (const product of expected) {
    const entry = registry.find((e) => e.id === product.id);
    const info = { registered: Boolean(entry) };
    if (entry) {
      info.entryViaShell = await fetchInfo(new URL(entry.entryUrl, shellUrl).href);
      const chunks = dist.products[product.name].lazyChunks;
      if (chunks.length > 0) {
        const publicPath = product.name === PRODUCT ? code.webpack?.publicPath : '/';
        const chunkBase = typeof publicPath === 'string' && publicPath.startsWith('/') ? publicPath : '/';
        const url = new URL(path.posix.join(chunkBase, chunks[0].name), shellUrl);
        info.chunkViaShell = { url: url.pathname, ...(await fetchInfo(url.href)) };
      }
    }
    app.products[product.name] = info;
  }

  if (browser) {
    try {
      const { call } = browser;
      await call('emulate', { pageId: 1, cpuThrottlingRate: CPU_THROTTLING });
      app.browser = { conditions: `CPU ×${CPU_THROTTLING}, медиана ${RUNS} прогонов, холодный кеш (как в check:web-vitals)`, routes: {} };
      for (const route of [options.route, ...options.compare]) {
        log(`production, браузер: ${route}`);
        const runs = [];
        for (let run = 0; run < RUNS; run += 1) {
          await call('navigate_page', { pageId: 1, type: 'url', url: 'about:blank' });
          await call('navigate_page', { pageId: 1, type: 'url', url: new URL(route, shellUrl).href, ignoreCache: true, timeout: 60000 });
          runs.push(parseJsonOutput((await call('evaluate_script', { pageId: 1, function: measureInPage, waitForStableDom: false })).text));
        }
        const render = parseJsonOutput((await call('evaluate_script', { pageId: 1, function: renderInPage, waitForStableDom: false })).text);
        const consoleText = (await call('list_console_messages', { pageId: 1 }).catch(() => ({ text: '' }))).text;
        const lcpValues = runs.map((r) => r.lcp).filter((v) => v !== null);
        const last = runs[runs.length - 1];
        const slug = route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root';
        app.browser.routes[route] = {
          lcpMs: lcpValues.length === runs.length ? median(lcpValues) : null,
          lcpMissingRuns: runs.length - lcpValues.length,
          cls: median(runs.map((r) => r.cls)),
          scriptBytesBeforeLcp: last.scriptBytes,
          heaviestScripts: last.scripts,
          lcpElement: last.lcpElement,
          render,
          consoleErrors: consoleProblems(consoleText),
          screenshot: await screenshot(call, `agent-metrics-${slug}.png`),
        };
      }
    } catch (error) {
      app.browserError = `${error.message} — MEASURE_VERBOSE=1 покажет вызовы MCP`;
      log(app.browserError);
    }
  }

  if (options.memory) {
    const scenario = path.join(wt, 'tests', 'memlab', `${PRODUCT}.scenario.js`);
    if (!fs.existsSync(scenario)) app.memory = { ran: false, reason: `сценария tests/memlab/${PRODUCT}.scenario.js нет` };
    else {
      log('память: memlab run (долго: до 40 страниц пагинации)');
      const memlab = [path.join(wt, 'node_modules', 'memlab', 'bin', 'memlab'), path.join(toolRoot, 'node_modules', 'memlab', 'bin', 'memlab')].find((f) => fs.existsSync(f));
      const result = spawnSync(process.execPath, [memlab, 'run', '--scenario', scenario], {
        cwd: wt,
        encoding: 'utf8',
        env: { ...cleanEnv, MEMLAB_APP_BASE_URL: shellUrl },
        maxBuffer: 64 * 1024 * 1024,
      });
      const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim().split('\n');
      app.memory = { ran: true, exitCode: result.status, leaks: (output.join('\n').match(/(\d+)\s+leak/i) || [])[1] ?? null, tail: output.slice(-12) };
    }
  }

  stop();
  await waitFor(async () => !(await shellResponds().catch(() => false)), 20000);
  return app;
}

// ---------- 5b. npm run dev: открывается ли продукт при локальной разработке ----------
// Ловушка репетиции: без .env продукта или с devMiddleware под условием сборка и production зелёные,
// а в dev entry не грузится — «Failed to fetch dynamically imported module». Видно только здесь.
async function runDev(browser) {
  const dev = { ran: true };
  if (await shellResponds().catch(() => false)) {
    dev.error = `на ${shellUrl} уже что-то отвечает — останови приложение, которое поднимал агент, и запусти снова`;
    return dev;
  }
  log('dev: npm run dev (webpack dev-серверы собираются несколько минут)');
  const logFd = fs.openSync(path.join(wt, 'agent-metrics-dev.log'), 'w');
  const child = spawn('npm', ['run', 'dev'], { cwd: wt, env: { ...cleanEnv, NODE_ENV: 'development' }, stdio: ['ignore', logFd, logFd], detached: true });
  cleanups.push(() => killGroup(child, 'SIGKILL'));
  try {
    if (!(await waitFor(shellResponds, 180000))) {
      dev.error = 'shell в npm run dev не ответил за 3 минуты (лог: agent-metrics-dev.log)';
      return dev;
    }
    const products = productList();
    await waitFor(async () => {
      const registry = await fetch(`${shellUrl}/api/microfrontends`).then((r) => r.json());
      return products.every((p) => registry.some((entry) => entry.id === p.id));
    }, 120000);
    const registry = await fetch(`${shellUrl}/api/microfrontends`).then((r) => r.json()).catch(() => []);
    const ownId = readJson('src', 'microfrontends', PRODUCT, 'manifest.json')?.id;
    const entry = registry.find((e) => e.id === ownId);
    dev.registered = Boolean(entry);
    dev.registeredProducts = registry.map((e) => e.id);
    if (entry) {
      dev.entryViaShell = await fetchInfo(new URL(entry.entryUrl, shellUrl).href, 240000);
    }
    if (browser) {
      const { call } = browser;
      await call('emulate', { pageId: 1, cpuThrottlingRate: 1 });
      await call('navigate_page', { pageId: 1, type: 'url', url: 'about:blank' });
      await call('navigate_page', { pageId: 1, type: 'url', url: new URL(options.route, shellUrl).href, ignoreCache: true, timeout: 240000 });
      let render = null;
      for (const startedAt = Date.now(); Date.now() - startedAt < 180000; ) {
        render = parseJsonOutput((await call('evaluate_script', { pageId: 1, function: renderInPage, waitForStableDom: false })).text);
        if (render.menuBuilt && (render.table || render.notFound || render.errorShown)) break;
        await sleep(3000);
      }
      await sleep(3000);
      dev.render = parseJsonOutput((await call('evaluate_script', { pageId: 1, function: renderInPage, waitForStableDom: false })).text);
      const consoleText = (await call('list_console_messages', { pageId: 1 }).catch(() => ({ text: '' }))).text;
      dev.consoleErrors = consoleProblems(consoleText);
      dev.failedDynamicImport = /Failed to fetch dynamically imported module/i.test(consoleText);
      const slug = options.route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root';
      dev.screenshot = await screenshot(call, `agent-metrics-dev-${slug}.png`);
    }
  } catch (error) {
    dev.error = `${error.message} (лог: agent-metrics-dev.log)`;
    log(dev.error);
  } finally {
    killGroup(child);
    await waitFor(async () => !(await shellResponds().catch(() => false)), 20000);
    killGroup(child, 'SIGKILL');
    fs.closeSync(logFd);
  }
  return dev;
}

// ---------- 6. markdown ----------
function devRow(dev, format) {
  if (!dev || dev.skipped) return 'не проверял (--no-dev или --no-browser)';
  if (dev.error && !dev.render && dev.registered === undefined) return `не удалось: ${dev.error}`;
  return format(dev);
}

function renderMarkdown() {
  const c = metrics.code;
  const dev = metrics.dev;
  const own = dist.products[PRODUCT];
  const app = metrics.app || {};
  const route = app.browser?.routes?.[options.route];
  const product = app.products?.[PRODUCT];
  const contractText = !c.exists
    ? 'продукта нет'
    : !c.manifest
      ? 'manifest.json нет или не парсится'
      : Object.values(c.contract).every(Boolean)
        ? 'совпадает'
        : `расхождения: ${Object.entries(c.contract).filter(([, ok]) => !ok).map(([k]) => `${k}=${k === 'apiPrefix' ? c.manifest.api?.prefix : c.manifest[k]}`).join(', ')}`;
  const chunkText = !product?.chunkViaShell
    ? own?.lazyChunks?.length
      ? 'не проверял (приложение не поднималось)'
      : 'нет чанка'
    : product.chunkViaShell.error
      ? `ошибка: ${product.chunkViaShell.error}`
      : `${product.chunkViaShell.url} → ${product.chunkViaShell.status} ${product.chunkViaShell.contentType}${product.chunkViaShell.looksLikeHtml ? ' (index.html shell вместо чанка)' : ''}`;
  const babelText = !c.exists ? '—' : !c.babel.exists ? 'нет своего (корневой, modules: cjs)' : c.babel.reexportsRoot ? 'реэкспорт корневого (modules: cjs)' : `свой, modules: ${c.babel.modules}`;
  const outOfScope = metrics.git.outOfScope;
  const rows = [
    ['Прогон', `${label} · worktree \`${wt}\` · старт \`${metrics.git.base}\` (${metrics.git.baseRef})`],
    [`Продукт \`src/microfrontends/${PRODUCT}/\``, yesNo(c.exists)],
    ['Публичный контракт в manifest (id, routePath, entryPath, api.prefix, menuLabel)', contractText],
    ['Регистрация в nx.json и workspaces', c.exists ? (Object.values(c.registered).every(Boolean) ? 'да' : `не полностью: ${Object.entries(c.registered).filter(([, ok]) => !ok).map(([k]) => k).join(', ')}`) : '—'],
    ['`require()` в клиенте продукта', c.exists ? `${c.client.require}${c.client.requireFiles.length ? ` (${c.client.requireFiles.join(', ')})` : ''}` : '—'],
    ['Babel продукта', babelText],
    ['Webpack продукта: общий helper / publicPath', c.exists ? `${yesNo(c.webpack.usesCommonHelper)} / \`${c.webpack.publicPath}\`${c.webpack.moduleFederation ? ' / ModuleFederationPlugin!' : ''}` : '—'],
    ['`import()` / `React.lazy` / `<Suspense>` в клиенте', c.exists ? `${c.client.dynamicImport} / ${c.client.reactLazy} / ${yesNo(c.client.suspense)}` : '—'],
    ['Lazy-чанк в dist продукта', own ? (own.lazyChunks.length ? own.lazyChunks.map((ch) => `${ch.name} (${kb(ch.bytes)})`).join(', ') : 'нет') : '—'],
    ['Entry продукта (dist)', own ? mb(own.entryBytes) : '—'],
    ['Entry соседей для сравнения', Object.entries(dist.products).filter(([n]) => n !== PRODUCT).map(([n, p]) => `${n}: ${mb(p.entryBytes)}`).join(' · ') || '—'],
    ['Стартовый бандл shell (main.*.js)', dist.shellMain ? mb(dist.shellMain.bytes) : '—'],
    ['Код страницы в shell (static import)', c.pageCodeInShell.length ? c.pageCodeInShell.join(', ') : 'нет'],
    ['Продукт зарегистрировался в shell / entry через shell', product ? `${yesNo(product.registered)} / ${product.entryViaShell ? `${product.entryViaShell.status} ${product.entryViaShell.contentType}` : '—'}` : 'не проверял'],
    ['Чанк через shell', chunkText],
    [`Страница ${options.route} через shell: пункт меню / таблица / строк / пагинация`, route ? `${yesNo(route.render.menuItem)} / ${yesNo(route.render.table)} / ${route.render.rows} / ${yesNo(route.render.pagination)}${route.render.notFound ? ' / NOT FOUND' : ''}${route.render.errorShown ? ' / показана ошибка' : ''}` : 'не проверял'],
    [`LCP / CLS / JS до LCP (${options.route})`, route ? `${ms(route.lcpMs)}${route.lcpMissingRuns ? ` (LCP не зафиксирован в ${route.lcpMissingRuns} из 3)` : ''} / ${route.cls} / ${mb(route.scriptBytesBeforeLcp)}` : 'не проверял'],
    ...options.compare.map((r) => [`LCP / CLS / JS до LCP (${r})`, app.browser?.routes?.[r] ? `${ms(app.browser.routes[r].lcpMs)} / ${app.browser.routes[r].cls} / ${mb(app.browser.routes[r].scriptBytesBeforeLcp)}` : 'не проверял']),
    ['Ошибки в консоли браузера', route ? (route.consoleErrors.length ? route.consoleErrors.join(' · ') : 'нет') : 'не проверял'],
    ['`useAutoTrimCells` в продукте', c.exists ? (c.client.useAutoTrimCells.length ? c.client.useAutoTrimCells.join(', ') : 'нет') : '—'],
    ['`Map`/`Set` на уровне модуля в клиенте', c.exists ? (c.client.moduleLevelMap.length ? c.client.moduleLevelMap.join(', ') : 'нет') : '—'],
    ['useMemo / useCallback / React.memo', c.exists ? `${c.client.useMemo} / ${c.client.useCallback} / ${c.client.reactMemo}` : '—'],
    ['Компоненты, объявленные внутри компонента (эвристика)', c.exists ? String(c.client.nestedComponents) : '—'],
    ['.env продукта (MICROFRONT_PORT / CLIENT_PORT)', c.exists ? (c.localRun.env ? `${c.localRun.env.MICROFRONT_PORT} / ${c.localRun.env.CLIENT_PORT}` : 'нет — в dev продукт не откроется') : '—'],
    ['Продукт в скриптах dev / dev:prod / build:prod:run', c.exists ? `${yesNo(c.localRun.inDev)} / ${yesNo(c.localRun.inDevProd)} / ${yesNo(c.localRun.inBuildProdRun)}` : '—'],
    ['Конфликт портов .env с shell и соседями', c.exists ? (c.localRun.portConflicts.length ? c.localRun.portConflicts.join(' · ') : 'нет') : '—'],
    ['Откуда dev-сервер отдаёт entry (нужно «/»)', c.exists ? `\`${c.localRun.devEntryPublicPath}\`` : '—'],
    ['npm run dev: продукт зарегистрировался / entry через shell', devRow(dev, (d) => `${yesNo(d.registered)} / ${d.entryViaShell ? (d.entryViaShell.error ? `ошибка: ${d.entryViaShell.error}` : `${d.entryViaShell.status} ${d.entryViaShell.contentType}${d.entryViaShell.looksLikeHtml ? ' (HTML вместо JS)' : ''}`) : '—'}`)],
    [`npm run dev: страница ${options.route} — пункт меню / таблица / Not Found`, devRow(dev, (d) => (d.render ? `${yesNo(d.render.menuItem)} / ${yesNo(d.render.table)} / ${yesNo(d.render.notFound)}` : 'браузер не открывал'))],
    ['npm run dev: «Failed to fetch dynamically imported module»', devRow(dev, (d) => (d.render ? (d.failedDynamicImport ? 'ДА — entry продукта не загрузился' : 'нет') : 'браузер не открывал'))],
    ['Сервер продукта: общий bootstrap / CORS * / раздаёт /api/assets', c.exists ? `${yesNo(c.server.usesCommonBootstrap)} / ${yesNo(c.server.corsAny)} / ${yesNo(c.server.servesAssets)}` : '—'],
    [`Сценарий памяти tests/memlab/${PRODUCT}.scenario.js`, c.memlabScenario.exists ? `есть${c.memlabScenario.usesHelper ? ', на общем helper' : ', НЕ на create-route-pagination-scenario'}` : 'нет'],
    ['MemLab (--memory)', app.memory ? (app.memory.ran ? `код выхода ${app.memory.exitCode}${app.memory.leaks !== null ? `, утечек: ${app.memory.leaks}` : ''}` : app.memory.reason) : 'не запускал'],
    ['Правки вне продукта и регистрации', outOfScope.length ? outOfScope.join(', ') : 'нет'],
    ['Сборка `npm run build`', metrics.build.ran ? `код выхода ${metrics.build.exitCode}, ${metrics.build.seconds} с` : 'пропущена (--skip-build)'],
    ['В agent-report.md упомянуты проверки', metrics.report.exists ? Object.entries(metrics.report.checksMentioned).filter(([, v]) => v).map(([k]) => k).join(', ') || 'ни одной' : 'отчёта нет'],
    ['В agent-report.md упомянуты скиллы и субагенты', metrics.report.exists ? Object.entries(metrics.report.harnessMentioned).filter(([, v]) => v).map(([k]) => k).join(', ') || 'ни одного' : 'отчёта нет'],
  ];
  const lines = [
    `# Метрики прогона: ${label}`,
    '',
    `Снято ${metrics.measuredAt} скриптом \`docs/demo/measure-run.cjs\` (одинаковым для Run A и Run B); код агента не менялся. Ветка \`${metrics.git.branch}\`.`,
    app.browser ? `Браузер: ${app.browser.conditions}.` : '',
    '',
    '| Метрика | Значение |',
    '|---|---|',
    ...rows.map(([k, v]) => `| ${k} | ${String(v).replace(/\|/g, '\\|')} |`),
    '',
    '## Изменённые файлы по зонам',
    ...Object.entries(metrics.git.files).flatMap(([zone, list]) => [`- **${zone}** (${list.length}):`, ...list.map((f) => `  - \`${f}\``)]),
  ];
  if (route) {
    lines.push('', `## Браузер: ${options.route}`, `- Скриншот: \`${route.screenshot || 'не снят'}\``, `- LCP-элемент: ${route.lcpElement || '—'}`, `- Самые тяжёлые скрипты до LCP: ${route.heaviestScripts.map((s) => `${s.name} ${mb(s.bytes)}`).join(', ') || '—'}`, `- Страница: ${JSON.stringify(route.render)}`);
  }
  if (dev && !dev.skipped) {
    lines.push('', '## npm run dev', `- Скриншот: \`${dev.screenshot || 'не снят'}\` · лог: \`agent-metrics-dev.log\``, `- Зарегистрированы в shell: ${(dev.registeredProducts || []).join(', ') || '—'}`);
    if (dev.render) lines.push(`- Страница: ${JSON.stringify(dev.render)}`);
    if (dev.consoleErrors?.length) lines.push('- Ошибки консоли:', ...dev.consoleErrors.map((e) => `  - \`${e.replace(/`/g, "'")}\``));
    if (dev.error) lines.push(`- Проблема: ${dev.error}`);
  }
  if (app.error || app.browserError || app.startupErrors) lines.push('', '## Проблемы запуска', app.error ? `- ${app.error}` : '', app.browserError ? `- ${app.browserError}` : '', ...(app.startupErrors || []).map((e) => `- ${e}`));
  if (metrics.build.ran) lines.push('', '## Сборка', '```', ...metrics.build.tail, '```');
  if (app.memory?.ran) lines.push('', '## MemLab', '```', ...app.memory.tail, '```');
  return `${lines.filter((l) => l !== undefined).join('\n')}\n`;
}

async function main() {
  let browser = null;
  if (options.browser) {
    try {
      browser = await openBrowser();
    } catch (error) {
      metrics.browserError = `${error.message} — Chrome через MCP не поднялся; в контейнере под root задай WEB_VITALS_MCP_ARGS="--executablePath <chrome> --chromeArg=--no-sandbox"`;
      log(metrics.browserError);
    }
    if (await shellResponds().catch(() => false)) {
      console.error(`На ${shellUrl} уже что-то отвечает. Останови npm run dev или приложение, которое поднимал агент, и запусти снова.`);
      process.exit(2);
    }
    metrics.app = await runProd(browser);
    if (metrics.browserError) metrics.app.browserError ||= metrics.browserError;
    metrics.dev = options.dev ? await runDev(browser) : { skipped: true };
    if (browser) await browser.close().catch(() => {});
  } else {
    metrics.app = { skipped: true };
    metrics.dev = { skipped: true };
  }
  fs.writeFileSync(path.join(wt, 'agent-metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
  const markdown = renderMarkdown();
  fs.writeFileSync(path.join(wt, 'agent-metrics.md'), markdown);
  process.stdout.write(markdown);
  log(`готово: ${path.join(wt, 'agent-metrics.md')} — вставь его в раздел 10 отчёта (промпт 2 в docs/demo/report-prompt.md)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(`[measure-run] ошибка: ${error.stack || error.message}`);
  process.exit(1);
});
