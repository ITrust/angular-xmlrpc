var path = require("path");
var webpack = require("webpack");

module.exports = {
  entry: {
    app: ["./src/service/index.ts"]
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
  target:"node",
  module:{
    loaders:[{
      test: /\.ts$/, 
      loader: 'ts-loader'
    }]
  }
};