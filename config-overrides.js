const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')

const isEqual = require("lodash/isEqual")

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = []
  }

  const updatedRules = config.module.rules.filter(
      (rule) => !isEqual(rule, { parser: { requireEnsure: false } })
  )
  config.module.rules = updatedRules;

  config.plugins.push(new CopyWebpackPlugin({
    patterns: [{
      from: 'node_modules/\@streamr/quick-dijkstra-wasm/dijkstraengine.wasm',
      to: 'static/js',
    }],
  }))
  config.plugins.push(new WriteFilePlugin())

  config.module.rules.push({
    test: /dijkstraengine\.js$/,
    loader: "exports-loader",
    options: {
      exports: "Module",
    }
  })

  config.output.futureEmitAssets = false

  if (process.env.REACT_APP_PUBLIC_URL) {
    config.output.publicPath = `${process.env.REACT_APP_PUBLIC_URL}/`

    if (!config.devServer) {
      config.devServer = {}
    }
    config.devServer.publicPath = `${process.env.REACT_APP_PUBLIC_URL}/`
  }

  return config
}
