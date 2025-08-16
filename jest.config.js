export default {
  testEnvironment: "node",

  // ES Modules configuration
  globals: {
    __VIA_MODULES__: true,
  },

  // Coverage configuration
  collectCoverageFrom: [
    "queries/**/*.js",
    "utils/**/*.js",
    "migrations/**/*.js",
  ],
  coverageDirectory: "coverage",

  // Test matching
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],

  // Setup and configuration
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,

  // Transform configuration (empty for ES modules)
  transform: {},

  testEnvironmentOptions: {
    url: "http://localhost",
  },
};
