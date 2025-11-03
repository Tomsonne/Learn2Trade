export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],   // dis à Jest où chercher
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {},
  moduleNameMapper: {
    "^@models/(.*)$": "<rootDir>/app/models/$1",
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ["**/test/**/*.test.js", "**/?(*.)+(spec|test).js"],
}
