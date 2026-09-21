'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const scenarioArgument = process.argv[2];

if (!scenarioArgument) {
  console.error('Memory validation requires an explicit route-specific scenario.');
  console.error('Usage: npm run check:memory -- tests/memlab/<route>.scenario.js');
  process.exit(2);
}

const scenarioPath = path.resolve(root, scenarioArgument);
const relativeScenario = path.relative(root, scenarioPath);
if (relativeScenario.startsWith('..') || path.isAbsolute(relativeScenario)) {
  console.error(`Memory scenario must be inside the repository: ${scenarioArgument}`);
  process.exit(2);
}
if (!fs.existsSync(scenarioPath) || !fs.statSync(scenarioPath).isFile()) {
  console.error(`Memory scenario does not exist: ${relativeScenario}`);
  process.exit(2);
}

console.log(`Running MemLab scenario: ${relativeScenario}`);
const memlabCli = path.join(root, 'node_modules', 'memlab', 'bin', 'memlab');
if (!fs.existsSync(memlabCli)) {
  console.error('MemLab is not installed. Run npm ci before memory validation.');
  process.exit(2);
}
const result = spawnSync(
  process.execPath,
  [memlabCli, 'run', '--scenario', scenarioPath],
  { cwd: root, env: process.env, stdio: 'inherit' },
);

if (result.error) {
  console.error(`Unable to start MemLab: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
