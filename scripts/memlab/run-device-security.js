'use strict';

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const shellClientDist = path.resolve(repoRoot, 'src', 'shell-app', 'client', 'dist');
const scenarioPath = path.resolve(repoRoot, 'tests', 'memlab', 'device-security.scenario.js');

const nxBin = path.resolve(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'nx.cmd' : 'nx',
);

const memlabBin = path.resolve(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'memlab.cmd' : 'memlab',
);

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

function waitForServer(url, { timeout = 45000, interval = 500 } = {}) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
        } else {
          retry();
        }
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
  await runCommand(nxBin, ['run', 'shell-client:build'], { cwd: repoRoot });

  const host = process.env.SHELL_HOST || '127.0.0.1';
  const port = process.env.SHELL_PORT || '4300';
  const baseUrl = `http://${host}:${port}`;

  const serverEnv = {
    ...process.env,
    NODE_ENV: 'production',
    CLIENT_DIST_DIR: shellClientDist,
    SHELL_HOST: host,
    SHELL_PORT: port,
  };

  const server = spawn('node', ['src/shell-app/server/shell-server.js'], {
    cwd: repoRoot,
    env: serverEnv,
    stdio: 'inherit',
  });

  try {
    await waitForServer(`${baseUrl}/api/health`);

    await runCommand(
      memlabBin,
      ['run', '--scenario', scenarioPath],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          MEMLAB_APP_BASE_URL: baseUrl,
        },
      },
    );
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      server.on('exit', resolve);
      server.on('close', resolve);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
