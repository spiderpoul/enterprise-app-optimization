const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { container } = require('webpack');
const statoscope = require('@statoscope/webpack-plugin');

const { ModuleFederationPlugin } = container;
const { dependencies = {} } = require('./package.json');

const sharedLibraries = [
  { shareKey: 'react', packageName: 'react' },
  { shareKey: 'react-dom', packageName: 'react-dom' },
  { shareKey: 'react-dom/client', packageName: 'react-dom' },
  { shareKey: 'react/jsx-runtime', packageName: 'react' },
  { shareKey: 'react/jsx-dev-runtime', packageName: 'react' },
  { shareKey: 'react-router', packageName: 'react-router' },
  { shareKey: 'react-router-dom', packageName: 'react-router-dom' },
];

const createSharedConfig = () =>
  sharedLibraries.reduce((shared, { shareKey, packageName }) => {
    const version = dependencies[packageName];

    if (!version) {
      return shared;
    }

    shared[shareKey] = {
      singleton: true,
      eager: true,
      shareScope: 'default',
      requiredVersion: version,
    };

    return shared;
  }, {});

const StatoscopeWebpackPlugin =
  statoscope && statoscope.default ? statoscope.default : statoscope;

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

const analyzerPlugins = () => {
  if (!shouldAnalyze) {
    return [];
  }

  return [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: path.resolve(__dirname, 'dist', 'reports', 'shell-client-bundle.html'),
    }),
    new StatoscopeWebpackPlugin({
      saveStatsTo: path.resolve(__dirname, 'dist', 'reports', 'shell-client-stats.json'),
      saveOnlyStats: false,
    }),
  ];
};

/** @type {import('webpack').Configuration} */
const config = {
  entry: path.resolve(__dirname, 'index.ts'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: '/',
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
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
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
                plugins: [
                  [
                    'autoprefixer',
                    {
                      flexbox: 'no-2009',
                    },
                  ],
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shellApp',
      shared: createSharedConfig(),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', '..', '..', 'public', 'index.html'),
      inject: 'body',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash].css',
    }),
    ...analyzerPlugins(),
  ],
  devServer: {
    host: process.env.CLIENT_HOST || '0.0.0.0',
    port: Number(process.env.CLIENT_PORT || 4301),
    historyApiFallback: true,
    hot: true,
    open: false,
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
  },
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
};

module.exports = config;
