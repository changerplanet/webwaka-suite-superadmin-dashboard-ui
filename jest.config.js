const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^webwaka-core-dashboard-control$': '<rootDir>/__mocks__/webwaka-core-dashboard-control.ts',
    '^webwaka-suite-superadmin-dashboard-control$': '<rootDir>/__mocks__/webwaka-suite-superadmin-dashboard-control.ts',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,ts}',
    'src/**/*.{js,ts}',
    'components/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
