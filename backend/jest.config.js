// backend/jest.config.js
export default {
  // Use the experimental VM modules runner so Jest works with ESM (type: "module")
  testEnvironment: "node",
  transform: {},           // No transform needed — native ESM via --experimental-vm-modules

  // Coverage settings
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/docs/**",
  ],

  // Separate coverage folders per test type
  coverageDirectory: "coverage",

  // Timeout for async tests (integration tests hit real DB)
  testTimeout: 30000,

  // Map test type scripts defined in package.json to specific patterns
  projects: [
    {
      displayName: "unit",
      testMatch: ["**/tests/unit/**/*.test.js"],
      coverageDirectory: "coverage/unit",
    },
    {
      displayName: "integration",
      testMatch: ["**/tests/integration/**/*.test.js"],
      coverageDirectory: "coverage/integration",
    },
  ],
};