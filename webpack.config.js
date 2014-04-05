var webpack = require('webpack');
var path = require('path');
var pkg = require('./package.json');

module.exports = {
  entry: path.join(__dirname, pkg.main),
  target: 'web',
  debug: false,
  watch: false,
  bail: false,
  devtool: false,
  node: {
    console: false,
    process: false,
    global: false,
    buffer: false,
    crypto: false
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'newton.js',
    sourceMapFilename: 'newton.map',
    library: 'Newton',
    libraryTarget: 'this'
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.ContextReplacementPlugin(/.*$/, /a^/)
  ]
};
