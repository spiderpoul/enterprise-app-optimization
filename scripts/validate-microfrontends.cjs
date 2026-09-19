const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const microfrontendsRoot = path.join(root, 'src', 'microfrontends');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const nx = JSON.parse(fs.readFileSync(path.join(root, 'nx.json'), 'utf8'));
const requiredManifestFields = ['id', 'name', 'menuLabel', 'routePath', 'entryPath', 'description'];
const errors = [];
const seenIds = new Map();
const seenRoutes = new Map();

const names = fs.readdirSync(microfrontendsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'common')
  .map((entry) => entry.name)
  .sort();

for (const name of names) {
  const relativeRoot = `src/microfrontends/${name}`;
  const manifestPath = path.join(root, relativeRoot, 'manifest.json');

  for (const side of ['client', 'server']) {
    const relativeProject = `${relativeRoot}/${side}`;
    const expectedName = `${name}-${side}`;
    for (const file of ['package.json', 'project.json', 'webpack.config.cjs']) {
      if (!fs.existsSync(path.join(root, relativeProject, file))) errors.push(`${expectedName}: missing ${file}`);
    }
    if (!rootPackage.workspaces.includes(relativeProject)) errors.push(`${expectedName}: missing root workspace`);
    if (nx.projects[expectedName] !== relativeProject) errors.push(`${expectedName}: missing or incorrect nx.json registration`);
  }

  if (!fs.existsSync(manifestPath)) {
    errors.push(`${name}: missing manifest.json`);
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const field of requiredManifestFields) {
    if (typeof manifest[field] !== 'string' || !manifest[field].trim()) errors.push(`${name}: invalid manifest.${field}`);
  }
  if (!manifest.routePath?.startsWith('/')) errors.push(`${name}: routePath must start with /`);
  if (!manifest.entryPath?.startsWith('/') || !manifest.entryPath.endsWith('.js')) errors.push(`${name}: entryPath must be an absolute .js path`);

  for (const [value, owner, label] of [
    [manifest.id, seenIds, 'id'],
    [manifest.routePath, seenRoutes, 'routePath'],
  ]) {
    if (!value) continue;
    if (owner.has(value)) errors.push(`${name}: duplicate manifest ${label} ${value} (also used by ${owner.get(value)})`);
    owner.set(value, name);
  }
}

if (errors.length) {
  console.error(`Microfrontend validation failed:\n- ${errors.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${names.length} microfrontends: ${names.join(', ')}`);
}
