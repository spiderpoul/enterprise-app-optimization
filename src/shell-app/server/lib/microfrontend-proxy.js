const express = require('express');
const { ensureDebugExtend } = require('./patch-debug-extend');

ensureDebugExtend();

const { createProxyMiddleware } = require('http-proxy-middleware');
const { createPathRewriter } = require('./proxy-config');

const createMicrofrontendProxyManager = ({ app }) => {
  if (!app) {
    throw new Error('Express app instance is required to create the proxy manager.');
  }

  const removeMiddleware = (router, middleware) => {
    router.stack = router.stack.filter((layer) => layer.handle !== middleware);
  };

  const proxiesById = new Map();
  const router = express.Router();

  app.use(router);

  const register = (entry) => {
    if (!entry || !entry.id) {
      return;
    }

    const existing = proxiesById.get(entry.id);

    if (existing) {
      if (existing.api?.middleware) {
        removeMiddleware(router, existing.api.middleware);
      }

      if (existing.asset?.middleware) {
        removeMiddleware(router, existing.asset.middleware);
      }

      proxiesById.delete(entry.id);
    }

    const record = {};

    const config = entry.apiProxy;

    if (config) {
      const rewritePath = createPathRewriter(config.prefix, config.pathRewrite);
      const middleware = createProxyMiddleware({
        changeOrigin: true,
        logLevel: 'warn',
        pathRewrite: (_path, req) => rewritePath(req.originalUrl || req.url || ''),
        target: config.target,
        ws: true,
      });

      router.use(config.prefix, middleware);

      record.api = {
        middleware,
        pathRewrite: config.pathRewrite,
        prefix: config.prefix,
        target: config.target,
      };

      const targetPathSuffix = config.pathRewrite === '/' ? '' : config.pathRewrite;
      console.log(
        `Proxying microfrontend API requests from ${config.prefix} to ${config.target}${targetPathSuffix}`,
      );
    }

    if (entry.assetPath && entry.entryUrl) {
      try {
        const targetUrl = new URL(entry.entryUrl);
        const rewritePath = createPathRewriter(entry.assetPath, targetUrl.pathname || '/');
        const middleware = createProxyMiddleware({
          changeOrigin: true,
          logLevel: 'warn',
          pathRewrite: (_path, req) => rewritePath(req.originalUrl || req.url || ''),
          target: targetUrl.origin,
        });

        router.use(entry.assetPath, middleware);

        record.asset = {
          middleware,
          path: entry.assetPath,
          target: targetUrl.href,
        };

        console.log(
          `Proxying microfrontend assets from ${entry.assetPath} to ${targetUrl.href}`,
        );
      } catch (error) {
        console.warn(
          `Unable to register asset proxy for microfrontend "${entry.id}":`,
          error?.message || error,
        );
      }
    }

    if (record.api || record.asset) {
      proxiesById.set(entry.id, record);
    }
  };

  const unregister = (id) => {
    if (!id) {
      return;
    }

    const existing = proxiesById.get(id);

    if (!existing) {
      return;
    }

    if (existing.api?.middleware) {
      removeMiddleware(router, existing.api.middleware);
    }

    if (existing.asset?.middleware) {
      removeMiddleware(router, existing.asset.middleware);
    }

    proxiesById.delete(id);
  };

  return {
    register,
    unregister,
  };
};

module.exports = { createMicrofrontendProxyManager };
