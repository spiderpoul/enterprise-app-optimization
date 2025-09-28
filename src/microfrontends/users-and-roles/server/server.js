const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const manifest = require('../manifest.json');
const {
  buildMicrofrontendDescriptor,
  createMicrofrontendAcknowledger,
} = require('../../common/bootstrap');
const {
  createRequestLogger,
  createResponseDelayMiddleware,
  parsePort,
  registerClientAssetHandling,
  resolveClientDevServerUrl,
  resolveClientDistDirectory,
} = require('../../common/server');
const { users } = require('./data/users');

const MICROFRONT_PORT = parsePort(process.env.MICROFRONT_PORT, 4402);
const MICROFRONT_HOST = String(process.env.MICROFRONT_HOST ?? '0.0.0.0');
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const MICROFRONT_PUBLIC_URL = process.env.MICROFRONT_PUBLIC_URL || 'http://localhost:4403';
const ACK_INTERVAL = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_HOST = String(process.env.CLIENT_HOST ?? '0.0.0.0');
const CLIENT_PORT = parsePort(process.env.CLIENT_PORT, 4403);
const CLIENT_DEV_SERVER_URL = resolveClientDevServerUrl({
  explicitUrl: process.env.CLIENT_DEV_SERVER_URL,
  host: CLIENT_HOST,
  port: CLIENT_PORT,
});

const DIST_DIR = resolveClientDistDirectory({
  explicitDistPath: process.env.CLIENT_DIST_DIR,
  serverDir: __dirname,
});

const app = express();

app.use(createRequestLogger('users-and-roles-server'));
app.use(createResponseDelayMiddleware());
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
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

const descriptor = buildMicrofrontendDescriptor({
  manifest,
  port: MICROFRONT_PORT,
  publicUrl: MICROFRONT_PUBLIC_URL,
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
