const { createProxyMiddleware } = require('http-proxy-middleware');

const getRequestPath = (req) => {
  if (typeof req?.originalUrl === 'string') {
    return req.originalUrl;
  }

  if (typeof req?.url === 'string') {
    return req.url;
  }

  return '';
};

const wrapProxyWithFilter = ({ filter, proxy }) => {
  const filteredProxy = (req, res, next) => {
    const requestPath = getRequestPath(req);

    if (!filter(requestPath, req)) {
      return next();
    }

    return proxy(req, res, next);
  };

  if (typeof proxy.upgrade === 'function') {
    filteredProxy.upgrade = (req, socket, head) => {
      const requestPath = getRequestPath(req);

      if (!filter(requestPath, req)) {
        return;
      }

      proxy.upgrade(req, socket, head);
    };
  }

  return filteredProxy;
};

const createFilteredProxyMiddleware = ({ filter, proxyOptions }) => {
  if (typeof filter !== 'function') {
    throw new Error('Proxy filter must be a function.');
  }

  if (!proxyOptions || typeof proxyOptions !== 'object') {
    throw new Error('Proxy options must be provided to create a filtered proxy.');
  }

  const normalizedOptions = { ...proxyOptions };

  if (!('logLevel' in normalizedOptions)) {
    normalizedOptions.logLevel = 'warn';
  }

  const proxy = createProxyMiddleware(normalizedOptions);

  return wrapProxyWithFilter({ filter, proxy });
};

const registerFilteredProxy = ({ app, filter, proxyOptions }) => {
  if (!app) {
    throw new Error('Express app instance is required to register a filtered proxy.');
  }

  const middleware = createFilteredProxyMiddleware({ filter, proxyOptions });

  app.use(middleware);

  if (typeof middleware.upgrade === 'function') {
    app.on('upgrade', middleware.upgrade);
  }

  return middleware;
};

module.exports = {
  createFilteredProxyMiddleware,
  getRequestPath,
  registerFilteredProxy,
};
