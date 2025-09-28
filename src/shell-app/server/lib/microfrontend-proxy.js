const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createPathRewriter } = require('./proxy-config');

const createMicrofrontendProxyManager = ({ app }) => {
  if (!app) {
    throw new Error('Express app instance is required to create the proxy manager.');
  }

  const proxyRegistry = new Map();
  const router = express.Router();

  app.use(router);

  const register = (entry) => {
    const config = entry?.apiProxy;

    if (!config) {
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
      `Proxying microfrontend API requests from ${config.prefix} to ${config.target}${targetPathSuffix}`,
    );
  };

  const unregister = (prefix) => {
    const existing = proxyRegistry.get(prefix);

    if (!existing) {
      return;
    }

    router.stack = router.stack.filter((layer) => layer.handle !== existing.middleware);
    proxyRegistry.delete(prefix);
  };

  return {
    register,
    unregister,
  };
};

module.exports = { createMicrofrontendProxyManager };
