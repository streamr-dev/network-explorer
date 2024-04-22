/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/node_modules/', '!*.stories.*'],
  coverageThreshold: {
    global: {
      lines: 50,
    },
  },
  coverageReporters: ['text'],
}
