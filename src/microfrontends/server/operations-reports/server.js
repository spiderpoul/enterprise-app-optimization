const express = require('express');
const fs = require('fs');
const path = require('path');

const MICROFRONT_PORT = Number(process.env.MICROFRONT_PORT || 4400);
const MICROFRONT_HOST = process.env.MICROFRONT_HOST || '0.0.0.0';
const SHELL_URL = process.env.SHELL_URL || 'http://localhost:4300';
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DIST_DIR = path.join(PROJECT_ROOT, 'microfrontends', 'operations-reports', 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, 'manifest.json');

const app = express();

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(DIST_DIR));

const readManifest = () => {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw);
};

const buildAckPayload = () => {
  const manifest = readManifest();
  const baseUrl = new URL('/', `http://localhost:${MICROFRONT_PORT}`);

  const entryUrl = new URL(manifest.entryPath, baseUrl).href;
  const manifestUrl = new URL('manifest.json', baseUrl).href;

  return {
    id: manifest.id,
    name: manifest.name,
    menuLabel: manifest.menuLabel,
    routePath: manifest.routePath,
    description: manifest.description,
    entryUrl,
    manifestUrl,
  };
};

const acknowledgeShell = async () => {
  try {
    const payload = buildAckPayload();
    const response = await fetch(`${SHELL_URL}/api/microfrontends/ack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Shell acknowledgement failed with status ${response.status}`);
    }

    console.log(`Microfrontend \"${payload.id}\" acknowledged by shell.`);
  } catch (error) {
    console.error('Unable to acknowledge shell:', error.message || error);
  }
};

const startAcknowledgementLoop = () => {
  acknowledgeShell();
  const intervalMs = Number(process.env.MICROFRONT_ACK_INTERVAL || 30000);
  setInterval(acknowledgeShell, intervalMs);
};

app.listen(MICROFRONT_PORT, MICROFRONT_HOST, () => {
  console.log(`Operations reports microfrontend listening at http://${MICROFRONT_HOST}:${MICROFRONT_PORT}`);
  startAcknowledgementLoop();
});
