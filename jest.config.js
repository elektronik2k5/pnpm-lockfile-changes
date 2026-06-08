module.exports = {
  transformIgnorePatterns: ['<rootDir>/node_modules/*'],
  transform: {
    '^.+\\.jsm?$': 'babel-jest',
  },
}
