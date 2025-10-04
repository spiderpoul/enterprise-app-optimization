const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { container } = require('webpack');
const { default: StatoscopeWebpackPlugin } = require('@statoscope/webpack-plugin');

const { ModuleFederationPlugin } = container;

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

const normalizeModuleFederationName = (value) =>
  String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '-')
    .replace(/-+(\w)/g, (_match, letter) => letter.toUpperCase())
    .replace(/^-/, '')
    .replace(/[^a-zA-Z0-9_]/g, '') || 'microfrontend';

const sharedLibraries = [
  { shareKey: 'react' },
  { shareKey: 'react-dom' },
  { shareKey: 'react-dom/client', packageName: 'react-dom' },
  { shareKey: 'react/jsx-runtime', packageName: 'react' },
  { shareKey: 'react/jsx-dev-runtime', packageName: 'react' },
  { shareKey: 'react-router' },
  { shareKey: 'react-router-dom' },
];

const createSharedConfig = (dependencies = {}) =>
  sharedLibraries.reduce((shared, { shareKey, packageName }) => {
    const dependencyName = packageName ?? shareKey;
    const version = dependencies[dependencyName];

    if (!version) {
      return shared;
    }

    shared[shareKey] = {
      singleton: true,
      eager: true,
      shareScope: 'default',
      requiredVersion: version,
      import: shareKey,
      packageName: dependencyName,
    };

    return shared;
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
  const dependencies = require(path.resolve(rootDir, 'package.json')).dependencies ?? {};
  const mfName = normalizeModuleFederationName(bundleName);

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
    plugins: [
      new ModuleFederationPlugin({
        name: mfName,
        shared: createSharedConfig(dependencies),
      }),
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
