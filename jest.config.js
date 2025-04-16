// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest', // Tells Jest to use ts-jest for .ts/.tsx files
    testEnvironment: 'node', // Specifies the environment (important for backend tests)
    clearMocks: true, // Automatically clear mock calls and instances between every test
    // You might need to add this if your tests are not in the root or __tests__
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    // roots: ['<rootDir>/src'], // Uncomment and adjust if tests are inside src
  };