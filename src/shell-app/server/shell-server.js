const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.SHELL_PORT || 4300);
const HOST = process.env.SHELL_HOST || '0.0.0.0';
const resolveClientDist = () => {
  if (process.env.CLIENT_DIST_DIR) {
    return path.resolve(process.env.CLIENT_DIST_DIR);
  }

  return path.resolve(__dirname, '..', 'client', 'dist');
};

const DIST_DIR = resolveClientDist();
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'microfrontends.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

ensureDataDir();

const loadRegistry = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Map();
    }

    return new Map(parsed.filter((entry) => entry && entry.id).map((entry) => [entry.id, entry]));
  } catch (error) {
    return new Map();
  }
};

const registry = loadRegistry();

const persistRegistry = () => {
  const serialized = JSON.stringify(Array.from(registry.values()), null, 2);
  fs.writeFileSync(DATA_FILE, serialized);
};

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
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
  }));

  res.json(microfrontends);
});

app.post('/api/microfrontends/ack', (req, res) => {
  const { id, name, menuLabel, routePath, entryUrl, description, manifestUrl } = req.body || {};

  if (!id || !name || !menuLabel || !routePath || !entryUrl) {
    return res.status(400).json({
      message:
        'id, name, menuLabel, routePath and entryUrl are required for microfrontend acknowledgement.',
    });
  }

  const sanitizedRoute = String(routePath).startsWith('/') ? routePath : `/${routePath}`;

  registry.set(id, {
    id,
    name,
    menuLabel,
    routePath: sanitizedRoute,
    entryUrl,
    description: description || '',
    manifestUrl: manifestUrl || null,
    lastAcknowledgedAt: new Date().toISOString(),
  });

  persistRegistry();

  res.status(204).end();
});

app.delete('/api/microfrontends/:id', (req, res) => {
  const { id } = req.params;
  if (!registry.has(id)) {
    return res.status(404).json({ message: `Microfrontend with id "${id}" was not found.` });
  }

  registry.delete(id);
  persistRegistry();
  res.status(204).end();
});

app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(express.static(DIST_DIR));

app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Shell server running at http://${HOST}:${PORT}`);
});
