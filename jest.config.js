export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'queries/**/*.js',
    'utils/**/*.js',
    'migrations/**/*.js'
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  transform: {},
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};
