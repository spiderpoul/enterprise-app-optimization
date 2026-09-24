'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const scenarioArgument = process.argv[2];

if (!scenarioArgument) {
  console.error('Проверке памяти нужен сценарий конкретного роута — того, который ты менял.');
  console.error('Запуск: npm run check:memory -- tests/memlab/<route>.scenario.js');
  console.error('Сценарий строится на tests/memlab/create-route-pagination-scenario.js; см. «Память и жизненный цикл DOM» в docs/performance.md.');
  process.exit(2);
}

const scenarioPath = path.resolve(root, scenarioArgument);
const relativeScenario = path.relative(root, scenarioPath);
if (relativeScenario.startsWith('..') || path.isAbsolute(relativeScenario)) {
  console.error(`Сценарий памяти должен лежать внутри репозитория: ${scenarioArgument}`);
  process.exit(2);
}
if (!fs.existsSync(scenarioPath) || !fs.statSync(scenarioPath).isFile()) {
  console.error(`Сценария памяти нет: ${relativeScenario}. Создай его для своего роута на tests/memlab/create-route-pagination-scenario.js; сценарий другого роута не подходит.`);
  process.exit(2);
}

console.log(`Запускаю сценарий MemLab: ${relativeScenario} (приложение должно быть запущено, адрес — MEMLAB_APP_BASE_URL)`);
const memlabCli = path.join(root, 'node_modules', 'memlab', 'bin', 'memlab');
if (!fs.existsSync(memlabCli)) {
  console.error('MemLab не установлен. Запусти npm ci перед проверкой памяти.');
  process.exit(2);
}
const result = spawnSync(
  process.execPath,
  [memlabCli, 'run', '--scenario', scenarioPath],
  { cwd: root, env: process.env, stdio: 'inherit' },
);

if (result.error) {
  console.error(`Не удалось запустить MemLab: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
