const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: { name: '[name].[ext]', outputPath: 'images' }
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'fac'),
  },
  plugins: [new HtmlWebpackPlugin()]
};
