const path = require('path')

module.exports = {
  plugins: ['prettier', 'react-hooks'],
  extends: [path.resolve('./src/eslint/airbnb-typescript'), 'react-app', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    '@typescript-eslint/return-await': 'warn',
    semi: 'off',
    'eol-last': 'warn',
    'linebreak-style': ['error', 'unix'],
    'object-curly-spacing': ['warn', 'always'],
    'no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
      },
    ],
    '@typescript-eslint/no-explicit-any': [
      'warn',
      {
        ignoreRestArgs: true,
      },
    ],
    'max-len': [
      'warn',
      {
        code: 100,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'react/jsx-key': 'error',
    'import/no-extraneous-dependencies': [
      'warn',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          'src/tests/**/*',
          '.storybook/**',
          '**/*.stories.tsx',
        ],
      },
    ],
    '@typescript-eslint/indent': 'off',
    'react/jsx-props-no-spreading': 'off',
    'import/prefer-default-export': 'off',
    'react/jsx-boolean-value': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/destructuring-assignment': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-multiple-empty-lines': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'react/jsx-indent': 'off',
    'no-unreachable': 'warn',
    'object-curly-newline': 'warn',
    'no-trailing-spaces': 'warn',
    'react/require-default-props': [
      'warn',
      {
        forbidDefaultForRequired: true,
        ignoreFunctionalComponents: true,
      },
    ],
  },
}
