const { createMicrofrontendConfig } = require('../../common/webpack/createMicrofrontendConfig.cjs');

module.exports = createMicrofrontendConfig({
  rootDir: __dirname,
  outputFileName: 'users-and-roles.js',
  bundleName: 'users-and-roles',
});
