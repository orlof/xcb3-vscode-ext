const path = require('path');

module.exports = {
  target: 'node', // VSCode extensions run in a Node.js-context
  mode: 'production', // production mode minifies the code
  entry: './extension.js', // your extension's entry point
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded
  },
  resolve: {
    extensions: ['.js']
  }
};
