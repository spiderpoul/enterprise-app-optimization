const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { default: StatoscopeWebpackPlugin } = require('@statoscope/webpack-plugin');

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createAnalyzerPlugins = ({ rootDir, bundleName, shouldAnalyze }) => {
  if (!shouldAnalyze) {
    return [];
  }

  const reportsDir = path.resolve(rootDir, 'dist', 'reports');

  return [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: path.resolve(reportsDir, `${bundleName}-bundle.html`),
    }),
    new StatoscopeWebpackPlugin({
      saveStatsTo: path.resolve(reportsDir, `${bundleName}-stats.json`),
      saveOnlyStats: false,
    }),
  ];
};

const externalLibraries = [
  { moduleName: 'react', globalVariable: 'React' },
  { moduleName: 'react-dom', globalVariable: 'ReactDOM' },
  { moduleName: 'react-dom/client', globalVariable: 'ReactDOMClient' },
  { moduleName: 'react/jsx-runtime', globalVariable: 'ReactJSXRuntime' },
  { moduleName: 'react/jsx-dev-runtime', globalVariable: 'ReactJSXDevRuntime' },
  { moduleName: 'react-router', globalVariable: 'ReactRouter' },
  { moduleName: 'react-router-dom', globalVariable: 'ReactRouterDOM' },
];

const createExternalsConfig = () =>
  externalLibraries.reduce((externals, { moduleName, globalVariable }) => {
    externals[moduleName] = globalVariable;
    return externals;
  }, {});

const createMicrofrontendConfig = ({
  rootDir,
  outputFileName,
  bundleName,
  entryFile = 'index.tsx',
  manifestFile = 'manifest.json',
}) => {
  require('dotenv').config({ path: path.resolve(rootDir, '..', '.env') });

  const isProduction = process.env.NODE_ENV === 'production';
  const shouldAnalyze = String(process.env.ANALYZE ?? '').trim() === 'true';
  return {
    entry: path.resolve(rootDir, entryFile),
    output: {
      path: path.resolve(rootDir, 'dist'),
      filename: outputFileName,
      module: true,
      library: {
        type: 'module',
      },
      publicPath: '/',
      clean: true,
    },
    experiments: {
      outputModule: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['autoprefixer']],
                },
              },
            },
          ],
        },
      ],
    },
    externalsType: 'window',
    externals: createExternalsConfig(),
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(rootDir, '..', manifestFile),
            to: path.resolve(rootDir, 'dist', 'manifest.json'),
          },
        ],
      }),
      ...createAnalyzerPlugins({ rootDir, bundleName, shouldAnalyze }),
    ],
    devServer: {
      host: process.env.CLIENT_HOST || '0.0.0.0',
      port: parsePort(process.env.CLIENT_PORT, 8080),
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      hot: true,
      client: {
        overlay: true,
      },
    },
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  };
};

module.exports = { createMicrofrontendConfig };
