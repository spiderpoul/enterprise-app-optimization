const path = require('path');

const resolveServerRoot = (directory) =>
  path.basename(directory) === 'dist' ? path.resolve(directory, '..') : directory;

const SERVER_DIR = resolveServerRoot(__dirname);
const PROJECT_ROOT = path.resolve(SERVER_DIR, '..');

require('dotenv').config({ path: path.resolve(PROJECT_ROOT, '.env') });

const express = require('express');
const manifest = require('../manifest.json');
const {
  buildMicrofrontendDescriptor,
  createMicrofrontendAcknowledger,
} = require('../../common/bootstrap.js');
const {
  createRequestLogger,
  createResponseDelayMiddleware,
  normalizeHost,
  parsePort,
  registerClientAssetHandling,
  resolveClientDevServerUrl,
  resolveClientDistDirectory,
} = require('../../common/server');
const swaggerUi = require('swagger-ui-express');
const apiDocumentation = require('./swagger/users-api.json');
const { users } = require('./data/users.js');

const MICROFRONT_PORT = parsePort(process.env.MICROFRONT_PORT, 4402);
const MICROFRONT_HOST = String(process.env.MICROFRONT_HOST ?? '0.0.0.0');
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const MICROFRONT_API_URL =
  process.env.MICROFRONT_API_URL || `http://${normalizeHost(MICROFRONT_HOST)}:${MICROFRONT_PORT}`;
const ACK_INTERVAL = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_HOST = String(process.env.CLIENT_HOST ?? '0.0.0.0');
const CLIENT_PORT = parsePort(process.env.CLIENT_PORT, 4403);
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

const publicUrlFromEnv = process.env.MICROFRONT_PUBLIC_URL?.trim();
const MICROFRONT_PUBLIC_URL = isProduction
  ? defaultPublicUrl
  : publicUrlFromEnv || defaultPublicUrl;

const DIST_DIR = resolveClientDistDirectory({
  explicitDistPath: process.env.CLIENT_DIST_DIR,
  serverDir: SERVER_DIR,
});

const app = express();

app.use(createRequestLogger('users-and-roles-server'));
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
  label: 'users-and-roles',
});

app.get('/api/users', (_, res) => {
  res.json(users);
});

app.get('/api', (_, res) => {
  res.json(users);
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
    `Users and roles microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`,
  );
  acknowledger.start();
});
