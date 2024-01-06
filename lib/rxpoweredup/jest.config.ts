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

// import type { Config } from 'jest';
//
// const CONFIG: Config = {
//     preset: 'ts-jest',
//     testEnvironment: 'node',
//     roots: [
//         '<rootDir>/src/'
//     ],
//     setupFiles: [
//         // imports 'reflect-metadata';
//         '<rootDir>/src/index.ts'
//     ],
//     transform: {
//         '^.+\\.tsx?$': [
//             'ts-jest',
//             { tsconfig: './tsconfig.dev.json' },
//         ],
//     },
//     collectCoverageFrom: [
//         'src/**/*.ts',
//         '!src/**/*.spec.ts',
//         '!src/**/main.ts',
//         '!src/**/index.ts',
//         '!src/**/public-api.ts',
//         '!src/**/constants.ts',
//         '!src/**/*.d.ts',
//         '!src/register.ts',
//         '!src/features/register-features-services.ts',
//         '!src/messages/register-messages-service.ts',
//     ]
// };
//
// export default CONFIG;
