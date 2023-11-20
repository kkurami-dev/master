module.exports = {
    roots: ['<rootDir>/test', '<rootDir>/src'],
    transform: {
        '^.+\\.mjs?$': 'ts-jest',
    },
    testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs', 'jsx', 'json', 'node'],
};
