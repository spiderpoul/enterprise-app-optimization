'use strict';

// Поднимает shell и все продукты из dist как в production и ждёт, пока shell зарегистрирует каждый продукт.
// Нужен для замеров (check:web-vitals, MCP chrome-devtools): `npm run build:prod:run` берёт MICROFRONT_PUBLIC_URL
// из .env продукта, а там адрес dev-сервера клиента, поэтому shell проксирует entry в пустоту (504).
//   npm run start:prod               — из готового dist
//   npm run start:prod -- --build    — сначала production-сборка всех проектов
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, NODE_ENV: 'production' };
const shellPort =
  dotenv.parse(fs.readFileSync(path.join(root, 'src/shell-app/.env'))).SHELL_PORT || '4300';
const shellUrl = `http://localhost:${shellPort}`;

const products = fs
  .readdirSync(path.join(root, 'src/microfrontends'))
  .filter((name) => fs.existsSync(path.join(root, 'src/microfrontends', name, 'manifest.json')))
  .map((name) => {
    const dir = path.join(root, 'src/microfrontends', name);
    const envFile = path.join(dir, '.env');
    if (!fs.existsSync(envFile)) {
      console.error(
        `src/microfrontends/${name}: нет .env с портами — продукт не на чем поднять. Заведи его по образцу ` +
          'src/microfrontends/users-and-roles/.env («Как сейчас правильно», шаг 5, в docs/architecture/microfrontends.md) ' +
          'и запусти npm run check:architecture.',
      );
      process.exit(1);
    }
    const port = dotenv.parse(fs.readFileSync(envFile)).MICROFRONT_PORT;
    const { id } = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    return { name, id, dir, publicUrl: `http://localhost:${port}` };
  });

if (process.argv.includes('--build')) {
  const build = spawnSync(npm, ['run', 'build'], { cwd: root, env, stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const children = [];
const start = (name, cwd, extraEnv = {}) => {
  const child = spawn(npm, ['run', 'start:dist'], {
    cwd,
    env: { ...env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const prefix = (chunk) => chunk.toString().replace(/^(?=.)/gm, `[${name}] `);
  child.stdout.on('data', (chunk) => process.stdout.write(prefix(chunk)));
  child.stderr.on('data', (chunk) => process.stderr.write(prefix(chunk)));
  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(
        `${name} завершился с кодом ${code}. Нет dist — запусти с --build; порт занят — останови npm run dev.`,
      );
      stop(1);
    }
  });
  children.push(child);
};
const stop = (code = 0) => {
  for (const child of children) child.kill('SIGTERM');
  process.exit(code);
};
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

async function waitFor(check, timeoutMs, message) {
  for (const startedAt = Date.now(); Date.now() - startedAt < timeoutMs; ) {
    if (await check().catch(() => false)) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.error(message);
  stop(1);
}

async function main() {
  start('shell', path.join(root, 'src/shell-app/server'));
  await waitFor(
    () => fetch(`${shellUrl}/api/microfrontends`).then((response) => response.ok),
    60000,
    `Shell не ответил на ${shellUrl} за минуту.`,
  );

  for (const product of products)
    start(product.name, path.join(product.dir, 'server'), {
      MICROFRONT_PUBLIC_URL: product.publicUrl,
    });
  // Готово, когда shell отдаёт entry каждого продукта: старые записи реестра могут остаться от dev и вести на 504.
  await waitFor(
    async () => {
      const registry = await fetch(`${shellUrl}/api/microfrontends`).then((response) =>
        response.json(),
      );
      const entries = products.map((product) => registry.find((entry) => entry.id === product.id));
      if (entries.some((entry) => !entry)) return false;
      const responses = await Promise.all(
        entries.map((entry) => fetch(new URL(entry.entryUrl, shellUrl), { method: 'HEAD' })),
      );
      return responses.every((response) => response.ok);
    },
    90000,
    `Не все продукты зарегистрировались в shell за 90 с: проверь ${shellUrl}/api/microfrontends и логи выше.`,
  );
  console.log(
    `Приложение готово (production): ${shellUrl} · продукты: ${products.map((product) => product.name).join(', ')}`,
  );
}

main();
