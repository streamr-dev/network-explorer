const isEqual = require('lodash/isEqual')

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = []
  }

  const updatedRules = config.module.rules.filter(
    (rule) => !isEqual(rule, { parser: { requireEnsure: false } }),
  )
  config.module.rules = updatedRules

  if (process.env.REACT_APP_PUBLIC_URL) {
    config.output.publicPath = `${process.env.REACT_APP_PUBLIC_URL}/`
  }

  return config
}
