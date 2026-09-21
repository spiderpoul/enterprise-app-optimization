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
      console.error(`Bundle validation cannot find ${workspacePath}/package.json.`);
      process.exit(1);
    }
    return JSON.parse(fs.readFileSync(packagePath, 'utf8')).name;
  });

if (process.env.BUNDLE_SKIP_BUILD !== '1') {
  for (const workspace of workspaces) {
    console.log(`Building ${workspace} for bundle validation...`);
    const npmCli = process.env.npm_execpath;
    if (!npmCli || !fs.existsSync(npmCli)) {
      console.error('Bundle validation must be started through npm so client workspaces can be built reproducibly.');
      process.exit(2);
    }
    const result = spawnSync(process.execPath, [npmCli, 'run', 'build', '-w', workspace], {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      console.error(`Bundle validation could not build ${workspace}.`);
      process.exit(result.status ?? 1);
    }
  }
}

const failures = [];
const results = [];
for (const [name, expected] of Object.entries(baseline.entries)) {
  const directory = path.join(root, expected.directory);
  if (!fs.existsSync(directory)) {
    failures.push(`${name}: build output ${expected.directory} does not exist.`);
    continue;
  }
  const pattern = new RegExp(expected.assetPattern);
  const matches = fs.readdirSync(directory).filter((asset) => pattern.test(asset));
  if (matches.length !== 1) {
    failures.push(`${name}: expected one initial asset matching ${expected.assetPattern}, found ${matches.length}.`);
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
    failures.push(`${name}: initial asset is ${bytes} bytes (+${deltaBytes} bytes / ${deltaPercent.toFixed(1)}% vs baseline); limits are +${expected.maxDeltaBytes} bytes and +${expected.maxDeltaPercent}%.`);
  }
}

const featureRoot = path.join(root, 'src', 'microfrontends', 'application-security');
if (fs.existsSync(featureRoot)) {
  const dist = path.join(featureRoot, 'client', 'dist');
  const assets = fs.existsSync(dist) ? fs.readdirSync(dist).filter((asset) => asset.endsWith('.js')) : [];
  const lazyAssets = assets.filter((asset) => asset !== 'application-security.js');
  if (lazyAssets.length === 0) failures.push('application-security-client: no lazy JavaScript chunk was emitted. Keep the route implementation behind a dynamic import boundary.');
  if (!lazyAssets.some((asset) => /application-security/i.test(asset))) failures.push('application-security-client: the lazy route chunk is not identifiable as application-security. Give the route chunk a stable diagnostic name.');
}

console.log('\nBundle baseline results:');
for (const result of results) {
  const sign = result.deltaPercent >= 0 ? '+' : '';
  console.log(`- ${result.name}: ${result.bytes} bytes (${result.deltaBytes >= 0 ? '+' : ''}${result.deltaBytes} bytes, ${sign}${result.deltaPercent.toFixed(1)}%; effective limit ${result.maximum})`);
}
if (failures.length > 0) {
  console.error('\nBundle validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error('\nSee docs/performance.md. Update the reviewed baseline only for an intentional change.');
  process.exit(1);
}
console.log('\nBundle validation passed. Shared React/router ownership is enforced by check:architecture.');
