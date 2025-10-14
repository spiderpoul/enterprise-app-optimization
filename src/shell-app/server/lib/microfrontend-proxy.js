const express = require('express');
const { ensureDebugExtend } = require('./patch-debug-extend');

ensureDebugExtend();

const { createProxyMiddleware } = require('http-proxy-middleware');
const { createPathRewriter } = require('./proxy-config');

const createMicrofrontendProxyManager = ({ app }) => {
  if (!app) {
    throw new Error('Express app instance is required to create the proxy manager.');
  }

  const proxyRegistry = new Map();
  const router = express.Router();

  app.use(router);

  const registerProxy = (config, label) => {
    if (!config || !config.prefix || !config.target) {
      return;
    }

    const existing = proxyRegistry.get(config.prefix);

    if (existing) {
      if (existing.target === config.target && existing.pathRewrite === config.pathRewrite) {
        return;
      }

      router.stack = router.stack.filter((layer) => layer.handle !== existing.middleware);
      proxyRegistry.delete(config.prefix);
    }

    const rewritePath = createPathRewriter(config.prefix, config.pathRewrite);
    const middleware = createProxyMiddleware({
      changeOrigin: true,
      logLevel: 'warn',
      pathRewrite: (_path, req) => rewritePath(req.originalUrl || req.url || ''),
      target: config.target,
      ws: true,
    });

    router.use(config.prefix, middleware);

    proxyRegistry.set(config.prefix, {
      middleware,
      pathRewrite: config.pathRewrite,
      target: config.target,
    });

    const targetPathSuffix = config.pathRewrite === '/' ? '' : config.pathRewrite;
    console.log(
      `Proxying microfrontend ${label} requests from ${config.prefix} to ${config.target}${targetPathSuffix}`,
    );
  };

  const register = (entry) => {
    registerProxy(entry?.apiProxy, 'API');
    registerProxy(entry?.assetProxy, 'asset');
  };

  const unregisterProxy = (prefix) => {
    if (!prefix) {
      return;
    }

    const existing = proxyRegistry.get(prefix);

    if (!existing) {
      return;
    }

    router.stack = router.stack.filter((layer) => layer.handle !== existing.middleware);
    proxyRegistry.delete(prefix);
  };

  const unregister = (entry) => {
    if (!entry) {
      return;
    }

    unregisterProxy(entry.apiProxy?.prefix);
    unregisterProxy(entry.assetProxy?.prefix);
  };

  return {
    register,
    unregister,
  };
};

module.exports = { createMicrofrontendProxyManager };
