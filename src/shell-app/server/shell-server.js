const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { initializationPlan } = require('./data/initialization-plan');

const app = express();
const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const normalizeHost = (host) => {
  const trimmed = String(host ?? '').trim();
  return trimmed && trimmed !== '0.0.0.0' ? trimmed : 'localhost';
};
const resolveClientDevServerUrl = () => {
  const explicitUrl = String(process.env.CLIENT_DEV_SERVER_URL ?? '').trim();
  if (explicitUrl) {
    return explicitUrl;
  }

  const host = normalizeHost(process.env.CLIENT_HOST);
  const port = parsePort(process.env.CLIENT_PORT, 4301);

  return `http://${host}:${port}`;
};

const createRequestLogger = (label) => (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const url = req.originalUrl || req.url;
    console.log(
      `[${label}] ${req.method} ${url} -> ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
};

const PORT = parsePort(process.env.SHELL_PORT, 4300);
const HOST = String(process.env.SHELL_HOST ?? '0.0.0.0');
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_DEV_SERVER_URL = resolveClientDevServerUrl();

const parseProxyTarget = (value) => {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (!url.protocol || !url.host) {
      return null;
    }

    return url.toString().replace(/\/$/, '');
  } catch (_error) {
    return null;
  }
};

const CLIENT_DEV_SERVER_TARGET = parseProxyTarget(CLIENT_DEV_SERVER_URL);
const shouldProxyClientRequest = (url) => typeof url === 'string' && !url.startsWith('/api');

const initializationPlanById = new Map(initializationPlan.map((step) => [step.id, step]));

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const resolveClientDist = () => {
  if (process.env.CLIENT_DIST_DIR) {
    return path.resolve(process.env.CLIENT_DIST_DIR);
  }

  return path.resolve(__dirname, '..', 'client', 'dist');
};

const DIST_DIR = resolveClientDist();
const SOURCE_DATA_DIR = path.join(__dirname, 'data');
const SOURCE_DATA_FILE = path.join(SOURCE_DATA_DIR, 'microfrontends.json');
const DATA_DIR = path.join(__dirname, 'dist', 'data');
const DATA_FILE = path.join(DATA_DIR, 'microfrontends.json');

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(SOURCE_DATA_FILE)) {
    fs.copyFileSync(SOURCE_DATA_FILE, DATA_FILE);
  }
};

ensureDataFile();

const ensureLeadingSlash = (value) => {
  if (typeof value !== 'string') {
    return '/';
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return '/';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const normalizeProxyPrefix = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed) {
    return null;
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  if (!withoutTrailingSlash || withoutTrailingSlash === '/') {
    return null;
  }

  return withoutTrailingSlash;
};

const normalizeProxyRewrite = (value) => {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (!trimmed || trimmed === '/') {
    return '/';
  }

  const withLeadingSlash = ensureLeadingSlash(trimmed);
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return withoutTrailingSlash || '/';
};

const sanitizeApiProxyConfig = (value) => {
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
    prefix,
    target,
    pathRewrite,
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

  return {
    id,
    name,
    menuLabel,
    routePath,
    entryUrl,
    description,
    manifestUrl,
    lastAcknowledgedAt,
    apiProxy: sanitizeApiProxyConfig(entry.apiProxy),
  };
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');

const createPathRewriter = (prefix, rewriteBase) => {
  const escapedPrefix = escapeRegex(prefix);
  const matcher = new RegExp(`^${escapedPrefix}`);
  const normalizedBase = rewriteBase === '/' ? '/' : normalizeProxyRewrite(rewriteBase);

  return (path) => {
    const stripped = path.replace(matcher, '');

    if (!stripped || stripped === '/') {
      return normalizedBase;
    }

    const suffix = stripped.startsWith('/') ? stripped : `/${stripped}`;

    if (normalizedBase === '/') {
      return suffix === '/' ? '/' : suffix;
    }

    return suffix === '/' ? normalizedBase : `${normalizedBase}${suffix}`;
  };
};

const loadRegistry = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Map();
    }

    const entries = parsed
      .map(sanitizeRegistryEntry)
      .filter((entry) => entry && entry.id && entry.entryUrl);

    return new Map(entries.map((entry) => [entry.id, entry]));
  } catch (error) {
    return new Map();
  }
};

const registry = loadRegistry();

const microfrontendProxyRegistry = new Map();

const registerMicrofrontendProxy = (entry) => {
  const config = entry?.apiProxy;

  if (!config) {
    return;
  }

  const existing = microfrontendProxyRegistry.get(config.prefix);
  if (existing) {
    if (existing.target === config.target && existing.pathRewrite === config.pathRewrite) {
      return;
    }

    console.warn(
      `Proxy for prefix ${config.prefix} is already registered; skipping conflicting registration`,
    );
    return;
  }

  const rewritePath = createPathRewriter(config.prefix, config.pathRewrite);

  const proxyMiddleware = createProxyMiddleware(config.prefix, {
    target: config.target,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
    pathRewrite: (path) => rewritePath(path),
  });

  app.use(proxyMiddleware);
  app.on('upgrade', proxyMiddleware.upgrade);

  microfrontendProxyRegistry.set(config.prefix, {
    target: config.target,
    pathRewrite: config.pathRewrite,
  });

  const targetPathSuffix = config.pathRewrite === '/' ? '' : config.pathRewrite;

  console.log(
    `Proxying microfrontend API requests from ${config.prefix} to ${config.target}${targetPathSuffix}`,
  );
};

for (const entry of registry.values()) {
  registerMicrofrontendProxy(entry);
}

const persistRegistry = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const serialized = JSON.stringify(Array.from(registry.values()), null, 2);
  fs.writeFileSync(DATA_FILE, serialized);
};

app.use(createRequestLogger('shell-server'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/initialization/steps', (_req, res) => {
  res.json(initializationPlan);
});

app.post('/api/initialization/steps/:stepId/complete', async (req, res) => {
  const { stepId } = req.params;
  const step = initializationPlanById.get(stepId);

  if (!step) {
    return res.status(404).json({ message: `Initialization step with id "${stepId}" was not found.` });
  }

  await delay(step.duration);

  res.json({ step });
});

app.post('/api/metrics/web-vitals', (req, res) => {
  if (req.body) {
    const { name, value, id, rating, navigationType, delta, ...rest } = req.body;
    console.log('[web-vitals]', {
      name,
      value,
      id,
      rating,
      navigationType,
      delta,
      context: rest,
    });
  }

  res.status(202).end();
});

app.get('/api/microfrontends', (_req, res) => {
  const microfrontends = Array.from(registry.values()).map((entry) => ({
    id: entry.id,
    name: entry.name,
    menuLabel: entry.menuLabel,
    routePath: entry.routePath,
    entryUrl: entry.entryUrl,
    description: entry.description || '',
    lastAcknowledgedAt: entry.lastAcknowledgedAt,
    manifestUrl: entry.manifestUrl || null,
    apiProxy: entry.apiProxy || null,
  }));

  res.json(microfrontends);
});

app.post('/api/microfrontends/ack', (req, res) => {
  const { id, name, menuLabel, routePath, entryUrl, description, manifestUrl, apiProxy } =
    req.body || {};

  if (!id || !name || !menuLabel || !routePath || !entryUrl) {
    return res.status(400).json({
      message:
        'id, name, menuLabel, routePath and entryUrl are required for microfrontend acknowledgement.',
    });
  }

  const acknowledgementTimestamp = new Date().toISOString();

  const entry = sanitizeRegistryEntry({
    id,
    name,
    menuLabel,
    routePath,
    entryUrl,
    description,
    manifestUrl,
    apiProxy,
    lastAcknowledgedAt: acknowledgementTimestamp,
  });

  if (!entry) {
    return res.status(400).json({ message: 'Unable to register microfrontend acknowledgement.' });
  }

  registry.set(entry.id, entry);
  registerMicrofrontendProxy(entry);
  persistRegistry();

  res.status(204).end();
});

app.delete('/api/microfrontends/:id', (req, res) => {
  const { id } = req.params;
  const existing = registry.get(id);

  if (!existing) {
    return res.status(404).json({ message: `Microfrontend with id "${id}" was not found.` });
  }

  registry.delete(id);
  if (existing.apiProxy?.prefix) {
    microfrontendProxyRegistry.delete(existing.apiProxy.prefix);
  }
  persistRegistry();
  res.status(204).end();
});

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

if (isProduction) {
  app.use(express.static(DIST_DIR));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
} else if (CLIENT_DEV_SERVER_TARGET) {
  const pathFilter = (path) => shouldProxyClientRequest(path);
  const clientProxy = createProxyMiddleware({
    target: CLIENT_DEV_SERVER_TARGET,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
    pathFilter,
  });

  app.use(clientProxy);
  app.on('upgrade', clientProxy.upgrade);

  console.log(`Proxying shell client requests to ${CLIENT_DEV_SERVER_TARGET}`);
} else {
  console.warn(
    'Shell client dev server URL is not defined or invalid; client assets will not be proxied.',
  );
}

app.listen(PORT, HOST, () => {
  console.log(`Shell server running at http://${HOST}:${PORT}`);
});
