// Jest config for pure unit tests (no React Native environment)
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true,
      },
    }],
  },
};
