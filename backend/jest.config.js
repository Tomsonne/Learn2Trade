export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],   // ⬅️ dis à Jest où chercher
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/?(*.)+(test).js'],
}
