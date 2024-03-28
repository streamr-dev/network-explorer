const shared = require('eslint-config-airbnb-typescript/lib/shared')

/**
 * Plugins is ['@typescript-eslint'] here, and it's already been declared by
 * `react-app`. Keeping both makes eslint explode thus we can only keep one.
 */
delete shared.plugins

module.exports = shared
