module.exports = {
  stories: ['../src/**/*.stories.@(jsx|tsx)'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
  ],

  webpackFinal: async (config) => {
    config.resolve.fallback.buffer = require.resolve('buffer/')

    return require('../config-overrides')(config)
  },

  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },

  docs: {
    autodocs: true,
  },
}
