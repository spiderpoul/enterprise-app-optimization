'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'performance', 'bundle-baseline.json'), 'utf8'));
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const workspaces = rootPackage.workspaces
  .filter((workspacePath) => workspacePath.endsWith('/client'))
  .map((workspacePath) => {
    const packagePath = path.join(root, workspacePath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error(`Проверка бандла не нашла ${workspacePath}/package.json: workspace из корневого package.json не существует.`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(packagePath, 'utf8')).name;
  });

if (process.env.BUNDLE_SKIP_BUILD !== '1') {
  for (const workspace of workspaces) {
    console.log(`Собираю ${workspace} для проверки бандла...`);
    const npmCli = process.env.npm_execpath;
    if (!npmCli || !fs.existsSync(npmCli)) {
      console.error('Запускай проверку бандла через npm (npm run check:bundle), чтобы клиентские workspaces собирались одинаково.');
      process.exit(2);
    }
    const result = spawnSync(process.execPath, [npmCli, 'run', 'build', '-w', workspace], {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      console.error(`Проверка бандла не смогла собрать ${workspace}: ошибка сборки выше. Длинный лог отдай субагенту log-analyst.`);
      process.exit(result.status ?? 1);
    }
  }
}

const failures = [];
const results = [];
for (const [name, expected] of Object.entries(baseline.entries)) {
  const directory = path.join(root, expected.directory);
  if (!fs.existsSync(directory)) {
    failures.push(`${name}: нет результата сборки ${expected.directory}. Собери проект или запусти без BUNDLE_SKIP_BUILD=1.`);
    continue;
  }
  const pattern = new RegExp(expected.assetPattern);
  const matches = fs.readdirSync(directory).filter((asset) => pattern.test(asset));
  if (matches.length !== 1) {
    failures.push(
      `${name}: ожидался один стартовый ассет по шаблону ${expected.assetPattern}, найдено ${matches.length}. Проверь outputFileName клиента и entryPath в manifest.`,
    );
    continue;
  }
  const bytes = fs.statSync(path.join(directory, matches[0])).size;
  const byteLimit = expected.bytes + expected.maxDeltaBytes;
  const percentLimit = Math.ceil(expected.bytes * (1 + expected.maxDeltaPercent / 100));
  const maximum = Math.min(byteLimit, percentLimit);
  const deltaPercent = ((bytes - expected.bytes) / expected.bytes) * 100;
  const deltaBytes = bytes - expected.bytes;
  results.push({ name, bytes, deltaBytes, deltaPercent, maximum });
  if (deltaBytes > expected.maxDeltaBytes || deltaPercent > expected.maxDeltaPercent) {
    failures.push(
      `${name}: стартовый ассет ${bytes} байт (+${deltaBytes} байт / ${deltaPercent.toFixed(1)}% к baseline), допуск +${expected.maxDeltaBytes} байт и +${expected.maxDeltaPercent}%. ` +
        'Скорее всего, код фичи попал в стартовый бандл: вынеси его в lazy-чанк (npm run analyze покажет, что выросло). ' +
        'Baseline в performance/ не ослабляй — это решает владелец (@perf-guild). См. «Бандл и загрузка» в docs/performance.md.',
    );
  }
}

const featureRoot = path.join(root, 'src', 'microfrontends', 'application-security');
if (fs.existsSync(featureRoot)) {
  const dist = path.join(featureRoot, 'client', 'dist');
  const assets = fs.existsSync(dist) ? fs.readdirSync(dist).filter((asset) => asset.endsWith('.js')) : [];
  const lazyAssets = assets.filter((asset) => asset !== 'application-security.js');
  if (lazyAssets.length === 0) {
    failures.push(
      'application-security-client: lazy-чанк не собран. Код страницы должен грузиться через динамический import(). ' +
        'Если import() уже есть, корневой babel.config.cjs превратил его в require(): нужен client/babel.config.cjs продукта с modules: false. ' +
        'См. «Подводные камни» и «Lazy-чанки через shell» в docs/architecture/microfrontends.md.',
    );
  }
  if (lazyAssets.length > 0 && !lazyAssets.some((asset) => /application-security/i.test(asset))) {
    failures.push(
      `application-security-client: lazy-чанки (${lazyAssets.slice(0, 2).join(', ')}) по имени не отличить от чужих — в нём нет application-security. ` +
        "Дай чанку стабильное имя с названием продукта (output.chunkFilename '<name>.[name].[contenthash:8].js'). " +
        'См. «Lazy-чанки через shell» в docs/architecture/microfrontends.md.',
    );
  }
}

// Lazy-чанк должен быть доступен через shell. Shell проксирует только entryPath и api.prefix
// продукта (src/shell-app/server/lib/microfrontend-proxy.js); на любой другой адрес приходит index.html.
const microfrontendsRoot = path.join(root, 'src', 'microfrontends');
for (const name of fs.readdirSync(microfrontendsRoot)) {
  const productRoot = path.join(microfrontendsRoot, name);
  const manifestPath = path.join(productRoot, 'manifest.json');
  const dist = path.join(productRoot, 'client', 'dist');
  if (name === 'common' || !fs.existsSync(manifestPath) || !fs.existsSync(dist)) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entryFile = path.basename(manifest.entryPath || '');
  const lazyAssets = fs.readdirSync(dist).filter((asset) => asset.endsWith('.js') && asset !== entryFile);
  if (lazyAssets.length === 0) continue;

  let publicPath;
  try {
    const exported = require(path.join(productRoot, 'client', 'webpack.config.cjs'));
    const config = typeof exported === 'function' ? exported({}, { mode: 'production' }) : exported;
    publicPath = config?.output?.publicPath;
  } catch (error) {
    failures.push(`${name}-client: не удалось прочитать client/webpack.config.cjs, чтобы проверить, откуда грузятся lazy-чанки: ${error.message}`);
    continue;
  }
  const prefix = manifest.api?.prefix?.replace(/\/+$/, '');
  if (!prefix || typeof publicPath !== 'string' || !publicPath.startsWith(`${prefix}/`)) {
    failures.push(
      `${name}-client: lazy-чанки (${lazyAssets.slice(0, 2).join(', ')}) грузятся с publicPath ${JSON.stringify(publicPath)}, ` +
        `а shell проксирует для этого продукта только ${manifest.entryPath} и ${prefix ? `${prefix}/*` : 'api.prefix из manifest'}, ` +
        'поэтому через shell браузер получит index.html вместо чанка, и страница не откроется. ' +
        `Отдавай чанки через API-префикс продукта (например, publicPath "${prefix || '<api.prefix>'}/assets/") и меняй только файлы этого продукта — ` +
        'рецепт «Lazy-чанки через shell» в docs/architecture/microfrontends.md.',
    );
  }
}

console.log('\nСтартовые ассеты относительно baseline:');
for (const result of results) {
  const sign = result.deltaPercent >= 0 ? '+' : '';
  console.log(`- ${result.name}: ${result.bytes} байт (${result.deltaBytes >= 0 ? '+' : ''}${result.deltaBytes} байт, ${sign}${result.deltaPercent.toFixed(1)}%; предел ${result.maximum})`);
}
if (failures.length > 0) {
  console.error('\nПроверка бандла не прошла:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error('\nКонтракт: docs/performance.md. Baseline меняют только ради намеренного изменения и с ревью @perf-guild.');
  process.exit(1);
}
console.log('\nПроверка бандла прошла. Общий React и роутер проверяет check:architecture.');
