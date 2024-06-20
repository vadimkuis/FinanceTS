const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  entry: './src/app.ts',
  devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  devServer: {
    static: 'dist',
    compress: true,
    port: 9000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    new CopyPlugin({
      patterns: [
        { from: "templates", to: "templates" },
        { from: "styles", to: "styles" },
        { from: "static/images", to: "images" },
      ],
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'ru'],
    }),
  ],
};