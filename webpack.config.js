var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: ["./dist/xmlrpc.module.js"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "xmlrpc.min.js"
  },
  externals: {
    'angular': 'angular'
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx', '']
  },
  module:{
    loaders:[{
      test: /\.js$/, 
      loader: 'babel-loader',
      exclude:[
        /node_modules/
      ],
      query: {
        presets: ['es2015']
      }
    }]
  }
};