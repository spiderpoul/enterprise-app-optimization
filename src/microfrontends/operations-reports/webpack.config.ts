import path from 'path';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: path.resolve(__dirname, 'client', 'index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'operations-reports.js',
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
        use: ['style-loader', 'css-loader'],
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
  ],
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
};

export default config;
