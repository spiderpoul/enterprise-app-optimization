const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { default: StatoscopeWebpackPlugin } = require('@statoscope/webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

/**
 * @returns {import('webpack').WebpackPluginInstance[]}
 */
const analyzerPlugins = () => {
  if (!shouldAnalyze) {
    return [];
  }

  return [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: path.resolve(__dirname, 'dist', 'reports', 'users-and-roles-bundle.html'),
    }),
    new StatoscopeWebpackPlugin({
      saveStatsTo: path.resolve(__dirname, 'dist', 'reports', 'users-and-roles-stats.json'),
      saveOnlyStats: false,
    }),
  ];
};

/** @type {import('webpack').Configuration} */
const config = {
  entry: path.resolve(__dirname, 'client', 'index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'users-and-roles.js',
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
  externalsType: 'window',
  externals: {
    react: 'React',
    'react/jsx-runtime': 'ReactJSXRuntime',
    'react/jsx-dev-runtime': 'ReactJSXDevRuntime',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOMClient',
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
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'manifest.json'),
          to: path.resolve(__dirname, 'dist', 'manifest.json'),
        },
      ],
    }),
    ...analyzerPlugins(),
  ],
  devServer: {
    host: process.env.CLIENT_HOST || '0.0.0.0',
    port: Number(process.env.CLIENT_PORT || 8080),
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

module.exports = config;
