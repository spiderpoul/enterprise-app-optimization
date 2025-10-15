#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const ARG_KEYS = new Set(['--version', '--port', '--mode', '--detached', '--no-detach', '--help', '-h']);

const printHelp = () => {
  console.log(`Usage: npm run compose:run -- --version <version> [--port <port>] [--mode <dev|prod>] [--no-detach]

Options:
  --version       Version identifier used for image tags and the compose project name (required)
  --port          Host port mapped to the shell service (defaults to 4300)
  --mode          Build mode: "prod" (default) or "dev"
  --no-detach     Run docker compose up in the foreground
  -h, --help      Show this help message
`);
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {
    version: undefined,
    port: undefined,
    mode: 'prod',
    detach: true,
  };

  const ensureValue = (option, index) => {
    if (index + 1 >= args.length || /^--/.test(args[index + 1])) {
      console.error(`Option ${option} requires a value.`);
      process.exit(1);
    }
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (!ARG_KEYS.has(arg)) {
      console.error(`Unknown option: ${arg}`);
      printHelp();
      process.exit(1);
    }

    switch (arg) {
      case '--version':
        ensureValue('--version', i);
        result.version = args[i + 1];
        i += 1;
        break;
      case '--port':
        ensureValue('--port', i);
        result.port = args[i + 1];
        i += 1;
        break;
      case '--mode':
        ensureValue('--mode', i);
        result.mode = args[i + 1] || 'prod';
        i += 1;
        break;
      case '--no-detach':
        result.detach = false;
        break;
      case '--detached':
        result.detach = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        break;
    }
  }

  if (!result.version) {
    console.error('The --version option is required.');
    printHelp();
    process.exit(1);
  }

  if (!result.port) {
    result.port = '4300';
  }

  if (!/^\d+$/.test(result.port)) {
    console.error(`The provided port "${result.port}" is not a valid numeric value.`);
    process.exit(1);
  }

  if (!['prod', 'production', 'dev', 'development'].includes(result.mode)) {
    console.error('Mode must be either "dev"/"development" or "prod"/"production".');
    process.exit(1);
  }

  return result;
};

const runCommand = (command, commandArgs, options = {}) => {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const sanitizeProjectName = (version) => {
  const sanitized = version.replace(/[^a-zA-Z0-9_.-]/g, '-').toLowerCase();
  return sanitized || 'latest';
};

const main = () => {
  const { version, port, mode, detach } = parseArgs();
  const rootDir = path.resolve(__dirname, '..');
  const buildMode = ['dev', 'development'].includes(mode) ? 'development' : 'production';
  const buildScript = buildMode === 'development' ? 'build:dev' : 'build';
  const sanitizedVersion = sanitizeProjectName(version);
  const projectName = `enterprise-app-${sanitizedVersion}`;

  const sharedEnv = {
    ...process.env,
    NODE_ENV: buildMode === 'development' ? 'development' : 'production',
    BUILD_MODE: buildMode,
    APP_IMAGE_TAG: sanitizedVersion,
    SHELL_HOST_PORT: port,
    COMPOSE_PROJECT_NAME: projectName,
  };

  console.log(`Building workspaces using "${buildScript}" in ${buildMode} mode...`);
  runCommand('npm', ['run', buildScript], {
    cwd: rootDir,
    env: sharedEnv,
  });

  console.log(`Building docker images with tag "${sanitizedVersion}" (project ${projectName})...`);
  runCommand('docker', ['compose', '-p', projectName, 'build'], {
    cwd: rootDir,
    env: sharedEnv,
  });

  const upArgs = ['compose', '-p', projectName, 'up'];
  if (detach) {
    upArgs.push('-d');
  }

  console.log(`Starting docker compose project on host port ${port}${detach ? ' in detached mode' : ''}...`);
  runCommand('docker', upArgs, {
    cwd: rootDir,
    env: sharedEnv,
  });
};

main();
