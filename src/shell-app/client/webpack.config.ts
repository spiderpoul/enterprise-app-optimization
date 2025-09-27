import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration, WebpackPluginInstance } from 'webpack';
import 'webpack-dev-server';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import StatoscopeWebpackPlugin from '@statoscope/webpack-plugin';

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
      reportFilename: path.resolve(__dirname, 'dist', 'reports', 'shell-client-bundle.html'),
    }),
    new StatoscopeWebpackPlugin({
      saveStatsTo: path.resolve(__dirname, 'dist', 'reports', 'shell-client-stats.json'),
      saveOnlyStats: false,
    }),
  ];

  return plugins;
};

const config: Configuration = {
  entry: path.resolve(__dirname, 'main.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@kaspersky/uif-react': path.resolve(__dirname, 'lib', 'uif-react.tsx'),
      '@kaspersky/uif': path.resolve(__dirname, 'lib', 'uif.ts'),
    },
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

export default config;
