const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeHost = (host) => {
  const trimmed = String(host ?? '').trim();
  return trimmed && trimmed !== '0.0.0.0' ? trimmed : 'localhost';
};

const resolveClientDevServerUrl = ({ explicitUrl, host, port }) => {
  const trimmed = String(explicitUrl ?? '').trim();
  if (trimmed) {
    return trimmed;
  }

  if (!port) {
    return undefined;
  }

  return `http://${normalizeHost(host)}:${port}`;
};

const resolveClientDistDirectory = ({ explicitDistPath, serverDir }) => {
  return explicitDistPath
    ? path.resolve(explicitDistPath)
    : path.resolve(serverDir, '..', 'client', 'dist');
};

const createRequestLogger = (label) => (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const url = req.originalUrl || req.url;
    console.log(`[${label}] ${req.method} ${url} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
};

const registerClientAssetHandling = ({
  app,
  distDir,
  devServerUrl,
  label,
  isProduction,
}) => {
  if (isProduction) {
    app.use(express.static(distDir));
    return;
  }

  if (devServerUrl) {
    const clientProxy = createProxyMiddleware(
      (pathname) => !pathname.startsWith('/api'),
      {
        target: devServerUrl,
        changeOrigin: true,
        ws: true,
        logLevel: 'warn',
      },
    );

    app.use(clientProxy);
    app.on('upgrade', clientProxy.upgrade);
    console.log(`Proxying ${label} client requests to ${devServerUrl}`);
    return;
  }

  console.warn(
    `${label} client dev server URL is not defined; client assets will not be proxied in development.`,
  );
};

module.exports = {
  createRequestLogger,
  normalizeHost,
  parsePort,
  registerClientAssetHandling,
  resolveClientDevServerUrl,
  resolveClientDistDirectory,
};
