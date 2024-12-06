const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src/index.jsx'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dev'),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader' }],
      },
      {
        test: /\.(jpe?g|png|gif|woff2?|eot|ttf|otf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 15000 },
          },
        ],
      },
    ],
  },
  resolve: {
    // allows us to do absolute imports from "src"
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    extensions: ['*', '.js', '.jsx'],
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dev'),
    historyApiFallback: true,
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      favicon: path.join(__dirname, 'src/favicon.png'),
    }),
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_MSW': JSON.stringify(true),
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};