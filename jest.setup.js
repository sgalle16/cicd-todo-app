// jest.setup.js

// Store original console methods (optional, but good practice if needed later)
// const originalLog = console.log;
// const originalError = console.error;
// const originalWarn = console.warn;
// const originalInfo = console.info;
// const originalDebug = console.debug;

// Override console methods with empty functions before tests run
console.log = () => {};
console.error = () => {};
console.warn = () => {};
console.info = () => {};
console.debug = () => {};

// If you needed to restore them after each test (less common for this use case):
// afterEach(() => {
//   console.log = originalLog;
//   console.error = originalError;
//   // ... restore others
// });
