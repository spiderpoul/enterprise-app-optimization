const fs = require('fs');
const path = require('path');
const {
  ensureLeadingSlash,
  normalizeProxyPrefix,
  normalizeProxyRewrite,
} = require('./proxy-config');

const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const ensureDataFile = ({ dataFile, sourceDataFile }) => {
  ensureDirectory(path.dirname(dataFile));

  if (!fs.existsSync(dataFile) && sourceDataFile && fs.existsSync(sourceDataFile)) {
    fs.copyFileSync(sourceDataFile, dataFile);
  }
};

const sanitizeProxyConfig = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const prefix = normalizeProxyPrefix(value.prefix);
  const target = typeof value.target === 'string' ? value.target.trim() : '';

  if (!prefix || !target) {
    return null;
  }

  const pathRewrite = normalizeProxyRewrite(value.pathRewrite);

  return {
    pathRewrite,
    prefix,
    target,
  };
};

const sanitizeRegistryEntry = (entry) => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const id = typeof entry.id === 'string' ? entry.id.trim() : '';

  if (!id) {
    return null;
  }

  const name = typeof entry.name === 'string' ? entry.name : id;
  const menuLabel = typeof entry.menuLabel === 'string' ? entry.menuLabel : name;
  const routePath = ensureLeadingSlash(entry.routePath || '/');
  const entryUrl = typeof entry.entryUrl === 'string' ? entry.entryUrl : '';
  const description = typeof entry.description === 'string' ? entry.description : '';
  const manifestUrl =
    typeof entry.manifestUrl === 'string' && entry.manifestUrl.trim()
      ? entry.manifestUrl
      : null;
  const lastAcknowledgedAt =
    typeof entry.lastAcknowledgedAt === 'string' ? entry.lastAcknowledgedAt : null;

  if (!entryUrl) {
    return null;
  }

  return {
    apiProxy: sanitizeProxyConfig(entry.apiProxy),
    assetProxy: sanitizeProxyConfig(entry.assetProxy),
    description,
    entryUrl,
    id,
    lastAcknowledgedAt,
    manifestUrl,
    menuLabel,
    name,
    routePath,
  };
};

const loadRegistryEntries = (dataFile) => {
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(sanitizeRegistryEntry)
      .filter((entry) => entry && entry.id && entry.entryUrl);
  } catch (_error) {
    return [];
  }
};

const createMicrofrontendRegistry = ({ dataFile, sourceDataFile }) => {
  if (!dataFile) {
    throw new Error('dataFile is required to create the microfrontend registry.');
  }

  ensureDataFile({ dataFile, sourceDataFile });
  const registry = new Map(loadRegistryEntries(dataFile).map((entry) => [entry.id, entry]));

  const values = () => Array.from(registry.values());
  const get = (id) => registry.get(id);
  const set = (entry) => {
    if (!entry || !entry.id) {
      throw new Error('Entry with a valid id is required to store in the registry.');
    }

    registry.set(entry.id, entry);
  };
  const remove = (id) => {
    const existing = registry.get(id);
    registry.delete(id);
    return existing;
  };
  const persist = () => {
    ensureDataFile({ dataFile, sourceDataFile });
    const serialized = JSON.stringify(values(), null, 2);
    fs.writeFileSync(dataFile, serialized);
  };

  return {
    dataFile,
    get,
    persist,
    remove,
    set,
    values,
  };
};

module.exports = {
  createMicrofrontendRegistry,
  sanitizeApiProxyConfig: sanitizeProxyConfig,
  sanitizeAssetProxyConfig: sanitizeProxyConfig,
  sanitizeRegistryEntry,
};
