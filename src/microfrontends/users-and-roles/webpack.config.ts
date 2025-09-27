import path from 'path';
import { fileURLToPath } from 'url';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import StatoscopeWebpackPlugin from '@statoscope/webpack-plugin';
import { WebpackPluginInstance } from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

const analyzerPlugins = (): WebpackPluginInstance[] => {
  if (!shouldAnalyze) {
    return [];
  }

  const plugins: WebpackPluginInstance[] = [
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

  return plugins;
};

const config: Configuration = {
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
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
};

export default config;
