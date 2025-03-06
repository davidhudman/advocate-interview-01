module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  // only run specific test files that aren't commented out
  testMatch: [
    '**/*.test.ts', // run all test files
    // '**/crm.test.ts',
    // '**/db.test.ts',
    // '**/health.test.ts',
    // '**/retry.test.ts',
    // '**/sync.test.ts',
    // '**/users.test.ts',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
