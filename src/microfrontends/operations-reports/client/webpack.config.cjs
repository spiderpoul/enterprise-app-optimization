const { createMicrofrontendConfig } = require('../../common/webpack/createMicrofrontendConfig.cjs');

module.exports = createMicrofrontendConfig({
  rootDir: __dirname,
  outputFileName: 'operations-reports.js',
  bundleName: 'operations-reports',
});
