var webpack = require('webpack'); //to access built-in plugins

var config = {
  entry: './public/scripts/config.js',
  output: {
    filename: 'my-first-webpack.bundle.js',
    path: './dist'
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
 module: {
         rules: [
             {
                 test: /\.js$/,
                  exclude: /(node_modules|bower_components)/,
                 use: [{
                    loader: 'babel-loader',
                    options: {
                          presets: ["es2015", { loose: true, "modules": false }]
                    }
                 }]
             }
         ]
     },
};

module.exports = config;