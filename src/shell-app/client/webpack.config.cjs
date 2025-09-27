const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const statoscope = require('@statoscope/webpack-plugin');

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
  entry: path.resolve(__dirname, 'main.tsx'),
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
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
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
    host: '0.0.0.0',
    port: Number(process.env.SHELL_CLIENT_PORT || 5173),
    historyApiFallback: true,
    hot: true,
    open: false,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
  },
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
};

module.exports = config;
