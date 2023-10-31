import 'reflect-metadata';
import type { Config } from 'jest';

const CONFIG: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        '<rootDir>/src/'
    ],
    setupFiles: [
        '<rootDir>/setup.jest.ts'
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            { tsconfig: './tsconfig.dev.json' },
        ],
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/**/main.ts',
        '!src/**/index.ts',
        '!src/**/public-api.ts',
        '!src/**/constants.ts',
        '!src/**/web/*',
        '!src/**/*.d.ts',
        '!src/register.ts',
        '!src/features/register-features-services.ts',
        '!src/messages/register-messages-service.ts',
    ]
};

export default CONFIG;
