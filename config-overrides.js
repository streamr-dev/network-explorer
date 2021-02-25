const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = []
  }

  config.module.rules[0] = { parser: { requireEnsure: true } }
  console.log(config.module.rules)

  config.plugins.push(new CopyWebpackPlugin({
    patterns: [{
      from: 'node_modules/\@streamr/quick-dijkstra-wasm/dijkstraengine.wasm',
      to: 'static/js',
    }],
  }))
  config.plugins.push(new WriteFilePlugin())

  config.module.rules.push(	{
    test: /dijkstraengine\.js$/,
    loader: "exports-loader",
    options: {
      exports: "Module",
    }
  })

  config.module.rules.push({
    test: /dijkstraengine\.wasm$/,
    loader: "file-loader",
    options: {
      publicPath: "build/static/js"
    }
  })

  config.output.futureEmitAssets = false

  return config;
}
