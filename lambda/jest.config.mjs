export default {
  testMatch: [
    "**/?(*.)+(spec|test).?(m)[tj]s?(x)",
  ],
  verbose: true,
    transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
}
