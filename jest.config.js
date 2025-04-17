/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest', // Tells Jest to use ts-jest for .ts/.tsx files
  testEnvironment: 'node', // Specifies the environment (important for backend tests)
  clearMocks: true, // Automatically clear mock calls and instances between every test
  // You might need to add this if your tests are not in the root or __tests__
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/src'], // Uncomment and adjust if tests are inside src

  // --- Cobertura Config ---
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  // Report Formats
  coverageReporters: ['text', 'lcov', 'html', 'cobertura'],
  // Ignore specific files/directories from coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/types/',
    '/src/server.ts',
    '/src/public/',
    '.pw.spec.ts$', // Exclude Playwright tests
    '.e2e.test.ts$', // Exclude e2e tests
    'jest.config.js',
    'jest.setup.js',
  ],

  // --- Reporters Config ---
  reporters: [
    'default',
    [
      'jest-junit', // JUnit XML
      {
        outputDirectory: './coverage', // Same folder as coverage
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],

  testMatch: ['<rootDir>/src/tests/**/*.test.ts', '!**/e2e/**', '!**/*.pw.spec.ts'],
  // testPathIgnorePatterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '.pw.spec.ts$', '.e2e.test.ts$'],
};
