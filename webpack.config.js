var webpack = require('webpack');
module.exports = {
entry: {
  entityApp: ['webpack/hot/dev-server', './app/entityApp.js'],
  componentApp: ['webpack/hot/dev-server', './app/componentApp.js']
},
output: {
  path: './public/js',
  filename: '[name].bundle.js',
  publicPath: 'http://localhost:8080/built/'
},
devServer: {
  contentBase: './public',
  publicPath: 'http://localhost:8080/built/'
},
module: {
  loaders: [
    { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    { test: /\.css$/, loader: 'style-loader!css-loader' },
    { test: /\.less$/, loader: 'style-loader!css-loader!less-loader'}
  ]
},
plugins: [
  new webpack.HotModuleReplacementPlugin()
],
target: 'electron'
}
