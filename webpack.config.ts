import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';
import 'webpack-dev-server';

const isProduction = process.env.NODE_ENV === 'production';

const config: Configuration = {
  entry: path.resolve(__dirname, 'src', 'shell-app', 'client', 'main.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/i,
        use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      inject: 'body'
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash].css'
    })
  ],
  devServer: {
    host: '0.0.0.0',
    port: 5173,
    historyApiFallback: true,
    hot: true,
    open: false
  },
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map'
};

export default config;
