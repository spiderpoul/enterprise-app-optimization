const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const manifest = require('../manifest.json');
const { buildMicrofrontendDescriptor, createMicrofrontendAcknowledger } = require('../../common/bootstrap');
const { reports } = require('./data/reports');

const MICROFRONT_PORT = Number(process.env.MICROFRONT_PORT || 4400);
const MICROFRONT_HOST = process.env.MICROFRONT_HOST || '0.0.0.0';
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const MICROFRONT_PUBLIC_URL = process.env.MICROFRONT_PUBLIC_URL;
const ACK_INTERVAL = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);

const DIST_DIR = process.env.CLIENT_DIST_DIR
  ? path.resolve(process.env.CLIENT_DIST_DIR)
  : path.resolve(__dirname, '..', 'client', 'dist');

const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(DIST_DIR));

app.get('/api/reports', (_, res) => {
  res.json(reports);
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
    `Operations reports microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`,
  );
  acknowledger.start();
});
