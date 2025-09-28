const { createPathRewriter } = require('./proxy-config');
const { registerFilteredProxy } = require('../../../server/lib/filtered-proxy');

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
    const pathFilter = (pathname) =>
      typeof pathname === 'string' && pathname.startsWith(config.prefix);
    const filteredProxy = registerFilteredProxy({
      app,
      filter: pathFilter,
      proxyOptions: {
        changeOrigin: true,
        pathRewrite: (path) => rewritePath(path),
        target: config.target,
        ws: true,
      },
    });

    proxyRegistry.set(config.prefix, {
      middleware: filteredProxy,
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
