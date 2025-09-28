const { createProxyMiddleware } = require('http-proxy-middleware');
const { createPathRewriter } = require('./proxy-config');

const createMicrofrontendProxyManager = ({ app }) => {
  if (!app) {
    throw new Error('Express app instance is required to create the proxy manager.');
  }

  const proxyRegistry = new Map();

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

      console.warn(
        `Proxy for prefix ${config.prefix} is already registered; skipping conflicting registration`,
      );
      return;
    }

    const rewritePath = createPathRewriter(config.prefix, config.pathRewrite);
    const filter = (pathname) => typeof pathname === 'string' && pathname.startsWith(config.prefix);
    const proxyMiddleware = createProxyMiddleware(filter, {
      changeOrigin: true,
      logLevel: 'warn',
      pathRewrite: (path) => rewritePath(path),
      target: config.target,
      ws: true,
    });

    app.use(proxyMiddleware);
    app.on('upgrade', proxyMiddleware.upgrade);

    proxyRegistry.set(config.prefix, {
      middleware: proxyMiddleware,
      pathRewrite: config.pathRewrite,
      target: config.target,
    });

    const targetPathSuffix = config.pathRewrite === '/' ? '' : config.pathRewrite;
    console.log(
      `Proxying microfrontend API requests from ${config.prefix} to ${config.target}${targetPathSuffix}`,
    );
  };

  const unregister = (prefix) => {
    proxyRegistry.delete(prefix);
  };

  return {
    register,
    unregister,
  };
};

module.exports = { createMicrofrontendProxyManager };
