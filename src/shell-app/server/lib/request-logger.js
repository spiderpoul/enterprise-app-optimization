const createRequestLogger = (label) => (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const url = req.originalUrl || req.url;

    console.log(`[${label}] ${req.method} ${url} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
};

module.exports = { createRequestLogger };
