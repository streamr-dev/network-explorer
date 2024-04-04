const isEqual = require('lodash/isEqual')
const webpack = require('webpack')

module.exports = function override(config, env) {
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  )

  const updatedRules = config.module.rules.filter(
    (rule) => !isEqual(rule, { parser: { requireEnsure: false } }),
  )

  config.module.rules = updatedRules

  if (process.env.REACT_APP_PUBLIC_URL) {
    config.output.publicPath = `${process.env.REACT_APP_PUBLIC_URL}/`
  }

  // Drop `ModuleScopePlugin`.
  config.resolve.plugins = []

  config.resolve.fallback = {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    path: require.resolve('path-browserify'),
    os: false,
  }

  return config
}
