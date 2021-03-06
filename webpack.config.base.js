/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import validate from 'webpack-validator';

export default validate({
  module: {
    loaders: [
    {
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      exclude: /node_modules/
    }, 
/*
    {
      test: /\.jsx?$/,
      loaders: ['babel-loader'],
      include: function(absPath) {
        if(absPath.indexOf('/node_modules/react-pivot/') > -1) {
          return true;
        } else {
             return false;
        }
      }
    }, 
*/
    {
      test: /\.(jpe?g|png|bmp|gif|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
      ]
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',

    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2'
  },

  // https://webpack.github.io/docs/configuration.html#resolve
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  plugins: [],

  externals: [
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
    "mssql",
    "tedious"
  ]
});
