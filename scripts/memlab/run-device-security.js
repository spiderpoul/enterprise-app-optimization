'use strict';

const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const defaultScenarioPath = path.resolve(
  repoRoot,
  'tests',
  'memlab',
  'device-security.scenario.js',
);

const memlabBin = path.resolve(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'memlab.cmd' : 'memlab',
);

const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function parseArguments(rawArgs) {
  const args = [...rawArgs];
  const passthrough = [];
  let scenario = null;
  let headful = false;

  while (args.length > 0) {
    const current = args.shift();

    if (current === '--scenario') {
      scenario = args.shift() ?? null;
      continue;
    }

    if (current && current.startsWith('--scenario=')) {
      scenario = current.slice('--scenario='.length);
      continue;
    }

    if (current === '--headful') {
      headful = true;
      continue;
    }

    if (current === '--headless') {
      headful = false;
      continue;
    }

    passthrough.push(current);
  }

  return {
    headful,
    passthrough,
    scenario: scenario ? path.resolve(repoRoot, scenario) : defaultScenarioPath,
  };
}

function isTruthy(value) {
  if (!value) {
    return false;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} exited with ${
            signal ? `signal ${signal}` : `code ${code}`
          }`,
        ),
      );
    });
  });
}

function waitForServer(url, { timeout = 60000, interval = 500 } = {}) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();

        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }

        retry();
      });

      request.on('error', retry);
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeout) {
        reject(new Error(`Timed out waiting for server at ${url}`));
        return;
      }

      setTimeout(check, interval);
    };

    check();
  });
}

async function main() {
  const { headful, passthrough, scenario } = parseArguments(process.argv.slice(2));

  if (!fs.existsSync(scenario)) {
    throw new Error(`Scenario file not found at ${scenario}`);
  }

  const host = process.env.SHELL_HOST?.trim() || '127.0.0.1';
  const port = process.env.SHELL_PORT?.trim() || '4300';
  const baseUrl = process.env.MEMLAB_APP_BASE_URL?.trim() || `http://${host}:${port}`;

  const shouldUseHeadful = headful || isTruthy(process.env.MEMLAB_HEADFUL);

  const serverProcess = spawn(npmBin, ['run', 'build:prod:run'], {
    cwd: repoRoot,
    env: {
      ...process.env,
    },
    stdio: 'inherit',
  });

  const stopServer = () => {
    if (!serverProcess.killed) {
      serverProcess.kill('SIGTERM');
    }
  };

  try {
    await waitForServer(`${baseUrl.replace(/\/$/, '')}/api/health`);

    const memlabArgs = ['run', '--scenario', scenario, ...passthrough];
    if (shouldUseHeadful) {
      memlabArgs.push('--headful');
    }

    await runCommand(memlabBin, memlabArgs, {
      cwd: repoRoot,
      env: {
        ...process.env,
        MEMLAB_APP_BASE_URL: baseUrl,
      },
    });
  } finally {
    stopServer();

    await new Promise((resolve) => {
      serverProcess.once('exit', resolve);
      serverProcess.once('close', resolve);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
