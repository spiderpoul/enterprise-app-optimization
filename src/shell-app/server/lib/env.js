const path = require('path');

const DEFAULT_RESPONSE_DELAY_MS = 300;

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseDelayMs = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeHost = (host) => {
  const trimmed = String(host ?? '').trim();

  return trimmed && trimmed !== '0.0.0.0' ? trimmed : 'localhost';
};

const resolveClientDevServerUrl = ({ explicitUrl, host, port }) => {
  const normalizedExplicitUrl = String(explicitUrl ?? '').trim();

  if (normalizedExplicitUrl) {
    return normalizedExplicitUrl;
  }

  const normalizedHost = normalizeHost(host);
  const normalizedPort = parsePort(port, 4301);

  return `http://${normalizedHost}:${normalizedPort}`;
};

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

const resolveServerRoot = (serverDir) =>
  path.basename(serverDir) === 'dist' ? path.resolve(serverDir, '..') : serverDir;

const resolveClientDistDirectory = ({ explicitDistPath, serverDir }) => {
  const normalizedServerDir = resolveServerRoot(serverDir);
  if (explicitDistPath) {
    return path.resolve(normalizedServerDir, explicitDistPath);
  }

  return path.resolve(normalizedServerDir, '..', 'client', 'dist');
};

const createEnvironment = ({ env, serverDir }) => {
  const port = parsePort(env.SHELL_PORT, 4300);
  const host = String(env.SHELL_HOST ?? '0.0.0.0');
  const responseDelayMs = parseDelayMs(env.SERVER_RESPONSE_DELAY_MS, DEFAULT_RESPONSE_DELAY_MS);
  const clientHost = String(env.CLIENT_HOST ?? '0.0.0.0');
  const clientPort = parsePort(env.CLIENT_PORT, 4301);
  const distDir = resolveClientDistDirectory({
    explicitDistPath: env.CLIENT_DIST_DIR,
    serverDir,
  });
  const explicitDevServerUrl = String(env.CLIENT_DEV_SERVER_URL ?? '').trim();
  const hasExplicitDevServerUrl = Boolean(explicitDevServerUrl);
  const hasExplicitDistDir = Boolean(String(env.CLIENT_DIST_DIR ?? '').trim());
  const serveStaticClient = env.NODE_ENV === 'production' || (!hasExplicitDevServerUrl && hasExplicitDistDir);
  const clientDevServerUrl = serveStaticClient
    ? null
    : resolveClientDevServerUrl({
        explicitUrl: explicitDevServerUrl,
        host: clientHost,
        port: clientPort,
      });
  const clientDevServerTarget = parseProxyTarget(clientDevServerUrl);

  return {
    clientDevServerTarget,
    clientDevServerUrl,
    distDir,
    host,
    isProduction: env.NODE_ENV === 'production',
    port,
    responseDelayMs,
    serveStaticClient,
  };
};

module.exports = {
  DEFAULT_RESPONSE_DELAY_MS,
  createEnvironment,
  normalizeHost,
  parseDelayMs,
  parsePort,
  parseProxyTarget,
  resolveClientDevServerUrl,
  resolveClientDistDirectory,
  resolveServerRoot,
};
