const path = require('path');
const { createServerWebpackConfig } = require('../../../../webpack.server.common.cjs');

module.exports = createServerWebpackConfig({
  projectRoot: __dirname,
  entry: path.resolve(__dirname, 'server.js'),
  outputFilename: 'server.js',
  copyPatterns: [
    { from: 'data', to: 'data' },
    { from: 'swagger', to: 'swagger' },
  ],
});
