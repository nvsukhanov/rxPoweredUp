/* eslint-disable */
export default {
    displayName: 'rxpoweredup',
    preset: '../../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.json' } ],
    },
    moduleFileExtensions: [ 'ts', 'js', 'html' ],
    setupFiles: [
        // imports 'reflect-metadata';
        '<rootDir>/src/index.ts'
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/**/main.ts',
        '!src/**/index.ts',
        '!src/**/public-api.ts',
        '!src/**/constants.ts',
        '!src/**/*.d.ts',
        '!src/register.ts',
        '!src/features/register-features-services.ts',
        '!src/messages/register-messages-service.ts',
    ],
    coverageDirectory: '../../coverage/lib/rxpoweredup',
};
