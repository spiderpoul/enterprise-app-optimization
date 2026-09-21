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
    failures.push(`${canonicalHelper} must use externalsType "window"; received ${JSON.stringify(config.externalsType)}.`);
  }
  for (const [moduleName, globalVariable] of Object.entries(expectedExternals)) {
    if (!config.externals || config.externals[moduleName] !== globalVariable) {
      failures.push(
        `${canonicalHelper} must externalize "${moduleName}" as window.${globalVariable}; otherwise each microfrontend can bundle a duplicate shared runtime.`,
      );
    }
  }
} catch (error) {
  failures.push(`${canonicalHelper} could not create a webpack config: ${error.message}`);
}

for (const file of sourceFiles.filter((candidate) => /webpack\.config\.[cm]?js$/.test(candidate))) {
  const contents = fs.readFileSync(file, 'utf8');
  if (/new\s+(?:(?:webpack\.)?container\.)?ModuleFederationPlugin\s*\(/.test(contents)) {
    failures.push(
      `${relative(file)} instantiates ModuleFederationPlugin. The canonical runtime uses registry descriptors, ES-module import, and window externals; do not add a second runtime strategy.`,
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
    failures.push(`${relative(productRoot)} has no manifest.json discovery contract.`);
  } else {
    try {
      const parsedManifest = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      for (const field of ['id', 'routePath', 'entryPath']) {
        if (typeof parsedManifest[field] !== 'string' || parsedManifest[field].trim() === '') {
          failures.push(`${relative(manifest)} must define a non-empty string "${field}".`);
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
              `${relative(manifest)} duplicates manifest ${field} "${value}" already used by ${registry.get(value)}.`,
            );
          } else {
            registry.set(value, relative(manifest));
          }
        }
      }
    } catch (error) {
      failures.push(`${relative(manifest)} is not valid JSON: ${error.message}`);
    }
  }

  for (const kind of ['client', 'server']) {
    const expectedName = `${name}-${kind}`;
    const projectPath = normalize(path.join('src', 'microfrontends', name, kind));
    const projectFile = path.join(root, projectPath, 'project.json');
    if (!workspacePaths.has(projectPath)) {
      failures.push(`${projectPath} is missing from root package.json workspaces.`);
    }
    if (nx.projects?.[expectedName] !== projectPath) {
      failures.push(`nx.json must register "${expectedName}" as "${projectPath}".`);
    }
    if (!fs.existsSync(projectFile)) {
      failures.push(`${projectPath}/project.json is missing.`);
    } else {
      try {
        const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
        if (project.name !== expectedName) {
          failures.push(`${relative(projectFile)} must use project name "${expectedName}".`);
        }
      } catch (error) {
        failures.push(`${relative(projectFile)} is not valid JSON: ${error.message}`);
      }
    }
  }

  if (!fs.existsSync(webpackConfig)) {
    failures.push(`${relative(productRoot)} has no client/webpack.config.cjs.`);
  } else {
    const config = fs.readFileSync(webpackConfig, 'utf8');
    if (!config.includes('../../common/webpack/createMicrofrontendConfig.cjs')) {
      failures.push(
        `${relative(webpackConfig)} bypasses the common microfrontend webpack configuration. Expected ../../common/webpack/createMicrofrontendConfig.cjs.`,
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
          `${relative(file)} references sibling microfrontend "${other}". Microfrontends must not depend directly on one another.`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Architecture validation failed:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error(`\nExpected canonical configuration: ${canonicalHelper}`);
  console.error('See: docs/architecture/microfrontends.md');
  process.exit(1);
}

console.log(`Architecture validation passed for ${microfrontendNames.length} microfrontends.`);
console.log(`Canonical configuration: ${canonicalHelper}`);
