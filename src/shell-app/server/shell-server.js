const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const { initializationPlan } = require('./data/initialization-plan');
const { dashboardData } = require('./data/dashboard');
const { createEnvironment } = require('./lib/env');
const { createRequestLogger } = require('./lib/request-logger');
const { createMicrofrontendProxyManager } = require('./lib/microfrontend-proxy');
const { registerFilteredProxy } = require('../../server/lib/filtered-proxy');
const {
  createMicrofrontendRegistry,
  sanitizeRegistryEntry,
} = require('./lib/registry');
const { cloneDeep, delay } = require('./lib/utils');

const microfrontendsRoot = path.resolve(__dirname, '..', '..', 'microfrontends');
const { users } = require(path.join(
  microfrontendsRoot,
  'users-and-roles',
  'server',
  'data',
  'users.js',
));
const { reports } = require(path.join(
  microfrontendsRoot,
  'operations-reports',
  'server',
  'data',
  'reports.js',
));

const environment = createEnvironment({ env: process.env, serverDir: __dirname });

const registry = createMicrofrontendRegistry({
  dataFile: path.join(__dirname, 'dist', 'data', 'microfrontends.json'),
  sourceDataFile: path.join(__dirname, 'data', 'microfrontends.json'),
});

const initializationPlanById = new Map(initializationPlan.map((step) => [step.id, step]));

const app = express();
const microfrontendProxyManager = createMicrofrontendProxyManager({ app });

for (const entry of registry.values()) {
  microfrontendProxyManager.register(entry);
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection detected.', { reason, promise });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception encountered.', error);
});

app.use(createRequestLogger('shell-server'));
app.use(express.json());

if (environment.responseDelayMs > 0) {
  app.use((_, __, next) => {
    setTimeout(next, environment.responseDelayMs);
  });
}

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
    return res
      .status(404)
      .json({ message: `Initialization step with id "${stepId}" was not found.` });
  }

  await delay(step.duration);

  res.json({ step });
});

app.post('/api/metrics/web-vitals', (req, res) => {
  if (req.body) {
    const { name, value, id, rating, navigationType, delta, ...rest } = req.body;
    console.log('[web-vitals]', {
      context: rest,
      delta,
      id,
      name,
      navigationType,
      rating,
      value,
    });
  }

  res.status(202).end();
});

app.get('/api/dashboard', (_req, res) => {
  res.json(dashboardData);
});

app.get('/api/mf/users-and-roles/users', (_req, res) => {
  res.json(cloneDeep(users));
});

app.get('/api/mf/reports', (_req, res) => {
  res.json(cloneDeep(reports));
});

app.get('/api/mf/reports/error', (_req, res) => {
  res.status(500).json({
    message: 'Simulated operations reports failure. Please retry shortly.',
  });
});

app.get('/api/microfrontends', (_req, res) => {
  const microfrontends = registry.values().map((entry) => ({
    apiProxy: entry.apiProxy || null,
    description: entry.description || '',
    entryUrl: entry.entryUrl,
    id: entry.id,
    lastAcknowledgedAt: entry.lastAcknowledgedAt,
    manifestUrl: entry.manifestUrl || null,
    menuLabel: entry.menuLabel,
    name: entry.name,
    routePath: entry.routePath,
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
    apiProxy,
    description,
    entryUrl,
    id,
    lastAcknowledgedAt: acknowledgementTimestamp,
    manifestUrl,
    menuLabel,
    name,
    routePath,
  });

  if (!entry) {
    return res.status(400).json({ message: 'Unable to register microfrontend acknowledgement.' });
  }

  registry.set(entry);
  microfrontendProxyManager.register(entry);
  registry.persist();

  res.status(204).end();
});

app.delete('/api/microfrontends/:id', (req, res) => {
  const { id } = req.params;
  const existing = registry.get(id);

  if (!existing) {
    return res.status(404).json({ message: `Microfrontend with id "${id}" was not found.` });
  }

  registry.remove(id);

  if (existing.apiProxy?.prefix) {
    microfrontendProxyManager.unregister(existing.apiProxy.prefix);
  }

  registry.persist();
  res.status(204).end();
});

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

if (environment.isProduction) {
  app.use(express.static(environment.distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(environment.distDir, 'index.html'));
  });
} else if (environment.clientDevServerTarget) {
  const shouldProxyClientRequest = (requestPath) =>
    typeof requestPath === 'string' && !requestPath.startsWith('/api');

  registerFilteredProxy({
    app,
    filter: shouldProxyClientRequest,
    proxyOptions: {
      changeOrigin: true,
      target: environment.clientDevServerTarget,
      ws: true,
    },
  });

  console.log(`Proxying shell client requests to ${environment.clientDevServerTarget}`);
} else {
  console.warn(
    'Shell client dev server URL is not defined or invalid; client assets will not be proxied.',
  );
}

const { host: HOST, port: PORT } = environment;

app.listen(PORT, HOST, () => {
  console.log(`Shell server running at http://${HOST}:${PORT}`);
});
