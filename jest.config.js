/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src', __dirname],
  testPathIgnorePatterns: [
    'src/booking/booking.controller.test.ts',
    'src/property/property.controller.test.ts',
  ],
};
