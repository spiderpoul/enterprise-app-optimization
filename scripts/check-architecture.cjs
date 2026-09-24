'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const microfrontendsRoot = path.join(root, 'src', 'microfrontends');
const canonicalHelper = 'src/microfrontends/common/webpack/createMicrofrontendConfig.cjs';
const failures = [];
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const nx = JSON.parse(fs.readFileSync(path.join(root, 'nx.json'), 'utf8'));
const workspacePaths = new Set(rootPackage.workspaces ?? []);
const manifestIds = new Map();
const manifestRoutes = new Map();

const normalize = (value) => value.split(path.sep).join('/');
const relative = (file) => normalize(path.relative(root, file));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const sourceFiles = walk(path.join(root, 'src')).filter((file) => /\.(?:[cm]?js|tsx?)$/.test(file));

const expectedExternals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/client': 'ReactDOMClient',
  'react/jsx-runtime': 'ReactJSXRuntime',
  'react/jsx-dev-runtime': 'ReactJSXDevRuntime',
  'react-router': 'ReactRouter',
  'react-router-dom': 'ReactRouterDOM',
};

try {
  const helperPath = path.join(root, canonicalHelper);
  const { createMicrofrontendConfig } = require(helperPath);
  const previousAnalyze = process.env.ANALYZE;
  process.env.ANALYZE = 'false';
  const config = createMicrofrontendConfig({
    rootDir: path.join(microfrontendsRoot, 'operations-reports', 'client'),
    outputFileName: 'architecture-check.js',
    bundleName: 'architecture-check',
  });
  if (previousAnalyze === undefined) delete process.env.ANALYZE;
  else process.env.ANALYZE = previousAnalyze;

  if (config.externalsType !== 'window') {
    failures.push(
      `${canonicalHelper}: externalsType должен быть "window", сейчас ${JSON.stringify(config.externalsType)}. ` +
        'Без него продукты не получат React из shell и соберут свою копию. См. «Как работает рантайм» в docs/architecture/microfrontends.md.',
    );
  }
  for (const [moduleName, globalVariable] of Object.entries(expectedExternals)) {
    if (!config.externals || config.externals[moduleName] !== globalVariable) {
      failures.push(
        `${canonicalHelper}: "${moduleName}" должен быть external window.${globalVariable}. ` +
          'Иначе каждый микрофронт соберёт свою копию общего рантайма: сборка зелёная, а в браузере «Invalid hook call». ' +
          'См. «Подводные камни» в docs/architecture/microfrontends.md и src/microfrontends/common/AGENTS.md.',
      );
    }
  }
} catch (error) {
  failures.push(`${canonicalHelper}: не удалось создать webpack-конфиг (${error.message}). Без него нельзя проверить window externals.`);
}

for (const file of sourceFiles.filter((candidate) => /webpack\.config\.[cm]?js$/.test(candidate))) {
  const contents = fs.readFileSync(file, 'utf8');
  if (/new\s+(?:(?:webpack\.)?container\.)?ModuleFederationPlugin\s*\(/.test(contents)) {
    failures.push(
      `${relative(file)}: создаётся ModuleFederationPlugin. Текущий рантайм — дескрипторы реестра, import() ES-модулей и window externals; ` +
        'второй рантайм не добавляем (Module Federation откатили в PR #26). См. «Не копируй» в docs/architecture/microfrontends.md.',
    );
  }
}

const microfrontendNames = fs
  .readdirSync(microfrontendsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'common')
  .map((entry) => entry.name);

for (const name of microfrontendNames) {
  const productRoot = path.join(microfrontendsRoot, name);
  const webpackConfig = path.join(productRoot, 'client', 'webpack.config.cjs');
  const manifest = path.join(productRoot, 'manifest.json');

  if (!fs.existsSync(manifest)) {
    failures.push(
      `${relative(productRoot)}: нет manifest.json. Без него shell не узнает о продукте. См. «Как сейчас правильно», шаг 1, в docs/architecture/microfrontends.md.`,
    );
  } else {
    try {
      const parsedManifest = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      for (const field of ['id', 'routePath', 'entryPath']) {
        if (typeof parsedManifest[field] !== 'string' || parsedManifest[field].trim() === '') {
          failures.push(
            `${relative(manifest)}: поле "${field}" должно быть непустой строкой — это часть публичного контракта продукта. См. «Blast radius» в docs/architecture/microfrontends.md.`,
          );
        }
      }
      for (const [field, registry] of [
        ['id', manifestIds],
        ['routePath', manifestRoutes],
      ]) {
        const value = parsedManifest[field];
        if (typeof value === 'string' && value.trim() !== '') {
          if (registry.has(value)) {
            failures.push(
              `${relative(manifest)}: ${field} "${value}" уже занят в ${registry.get(value)}. ` +
                `${field} — ключ реестра и меню, он должен быть уникальным. Выбери другое значение; существующее не меняй — на него ссылаются пользователи и MemLab.`,
            );
          } else {
            registry.set(value, relative(manifest));
          }
        }
      }
    } catch (error) {
      failures.push(`${relative(manifest)}: невалидный JSON (${error.message}).`);
    }
  }

  for (const kind of ['client', 'server']) {
    const expectedName = `${name}-${kind}`;
    const projectPath = normalize(path.join('src', 'microfrontends', name, kind));
    const projectFile = path.join(root, projectPath, 'project.json');
    if (!workspacePaths.has(projectPath)) {
      failures.push(
        `${projectPath}: нет в workspaces корневого package.json. Без этого npm не установит зависимости проекта и check:bundle его не соберёт. См. «Как сейчас правильно», шаг 4.`,
      );
    }
    if (nx.projects?.[expectedName] !== projectPath) {
      failures.push(
        `nx.json: проект "${expectedName}" должен быть зарегистрирован как "${projectPath}". Имена <name>-client и <name>-server совпадают с каталогом продукта. См. «Как сейчас правильно», шаг 4.`,
      );
    }
    if (!fs.existsSync(projectFile)) {
      failures.push(`${projectPath}/project.json: файла нет. Скопируй структуру проекта у эталона src/microfrontends/users-and-roles/.`);
    } else {
      try {
        const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
        if (project.name !== expectedName) {
          failures.push(`${relative(projectFile)}: имя проекта должно быть "${expectedName}" — так же, как в nx.json.`);
        }
      } catch (error) {
        failures.push(`${relative(projectFile)}: невалидный JSON (${error.message}).`);
      }
    }
  }

  if (!fs.existsSync(webpackConfig)) {
    failures.push(
      `${relative(productRoot)}: нет client/webpack.config.cjs. Собери клиент через общий helper — см. «Как сейчас правильно», шаг 2.`,
    );
  } else {
    const config = fs.readFileSync(webpackConfig, 'utf8');
    if (!config.includes('../../common/webpack/createMicrofrontendConfig.cjs')) {
      failures.push(
        `${relative(webpackConfig)}: конфиг собран в обход общего helper — нет ../../common/webpack/createMicrofrontendConfig.cjs. ` +
          'Скопированный конфиг теряет window externals: сборка зелёная, а в браузере второй React и «Invalid hook call». ' +
          'Вызови createMicrofrontendConfig и поправь только то, что нужно продукту. См. «Подводные камни» в docs/architecture/microfrontends.md.',
      );
    }
  }

  const productSources = walk(productRoot).filter(
    (file) => /\.(?:[cm]?js|tsx?)$/.test(file) && !normalize(file).includes('/dist/'),
  );
  for (const file of productSources) {
    const contents = fs.readFileSync(file, 'utf8');
    for (const other of microfrontendNames.filter((candidate) => candidate !== name)) {
      const directReference = new RegExp(`microfrontends[\\\\/]${other}[\\\\/]`);
      if (directReference.test(contents)) {
        failures.push(
          `${relative(file)}: ссылка на соседний микрофронт "${other}". Микрофронты не зависят друг от друга напрямую — ` +
            'общий код живёт в shell или в src/microfrontends/common/ (через скилл safe-change). См. «Никогда» в AGENTS.md.',
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Архитектурная проверка не прошла:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(`\nОбщая конфигурация сборки: ${canonicalHelper}`);
  console.error('Контракт: docs/architecture/microfrontends.md. Чини код, а не проверку.');
  process.exit(1);
}

console.log(`Архитектурная проверка прошла для микрофронтов: ${microfrontendNames.length}.`);
console.log(`Общая конфигурация сборки: ${canonicalHelper}`);
