const path = require('path');

const resolveServerRoot = (directory) =>
  path.basename(directory) === 'dist' ? path.resolve(directory, '..') : directory;

const SERVER_DIR = resolveServerRoot(__dirname);
const PROJECT_ROOT = path.resolve(SERVER_DIR, '..');
const COMMON_ROOT = path.resolve(PROJECT_ROOT, '..', 'common');

require('dotenv').config({ path: path.resolve(PROJECT_ROOT, '.env') });

const express = require('express');
const manifest = require(path.resolve(PROJECT_ROOT, 'manifest.json'));
const {
  buildMicrofrontendDescriptor,
  createMicrofrontendAcknowledger,
} = require(path.resolve(COMMON_ROOT, 'bootstrap.js'));
const {
  createRequestLogger,
  createResponseDelayMiddleware,
  normalizeHost,
  parsePort,
  registerClientAssetHandling,
  resolveClientDevServerUrl,
  resolveClientDistDirectory,
} = require(path.resolve(COMMON_ROOT, 'server'));
const swaggerUi = require('swagger-ui-express');
const apiDocumentation = require(path.resolve(
  SERVER_DIR,
  'swagger',
  'reports-api.json',
));
const { reports } = require(path.resolve(SERVER_DIR, 'data', 'reports.js'));

const MICROFRONT_PORT = parsePort(process.env.MICROFRONT_PORT, 4400);
const MICROFRONT_HOST = String(process.env.MICROFRONT_HOST ?? '0.0.0.0');
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const MICROFRONT_API_URL =
  process.env.MICROFRONT_API_URL || `http://${normalizeHost(MICROFRONT_HOST)}:${MICROFRONT_PORT}`;
const ACK_INTERVAL = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_HOST = String(process.env.CLIENT_HOST ?? '0.0.0.0');
const CLIENT_PORT = parsePort(process.env.CLIENT_PORT, 4401);
const CLIENT_DEV_SERVER_URL = isProduction
  ? undefined
  : resolveClientDevServerUrl({
      explicitUrl: process.env.CLIENT_DEV_SERVER_URL,
      host: CLIENT_HOST,
      port: CLIENT_PORT,
    });

const defaultPublicUrl = isProduction
  ? `http://${normalizeHost(MICROFRONT_HOST)}:${MICROFRONT_PORT}`
  : `http://${normalizeHost(CLIENT_HOST)}:${CLIENT_PORT}`;

const MICROFRONT_PUBLIC_URL =
  process.env.MICROFRONT_PUBLIC_URL?.trim() || defaultPublicUrl;

const DIST_DIR = resolveClientDistDirectory({
  explicitDistPath: process.env.CLIENT_DIST_DIR,
  serverDir: SERVER_DIR,
});

const app = express();

app.use(createRequestLogger('operations-reports-server'));
app.use(createResponseDelayMiddleware());
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiDocumentation, { explorer: true }));
app.get('/api/docs.json', (_req, res) => {
  res.json(apiDocumentation);
});

registerClientAssetHandling({
  app,
  distDir: DIST_DIR,
  devServerUrl: CLIENT_DEV_SERVER_URL,
  isProduction,
  label: 'operations-reports',
});

app.get('/api/reports', (_, res) => {
  res.json(reports);
});

app.get('/api', (_, res) => {
  res.json(reports);
});

const descriptor = buildMicrofrontendDescriptor({
  manifest,
  port: MICROFRONT_PORT,
  publicUrl: MICROFRONT_PUBLIC_URL,
  apiBaseUrl: MICROFRONT_API_URL,
});

const acknowledger = createMicrofrontendAcknowledger({
  descriptor,
  shellUrl: SHELL_URL,
  intervalMs: ACK_INTERVAL,
});

app.listen(MICROFRONT_PORT, MICROFRONT_HOST, () => {
  console.log(
    `Operations reports microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`,
  );
  acknowledger.start();
});
