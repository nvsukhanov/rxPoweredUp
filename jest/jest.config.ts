import 'reflect-metadata';
import type { Config } from 'jest';

const CONFIG: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        '<rootDir>/../src/'
    ],
    setupFiles: [
        '<rootDir>/setup.jest.ts'
    ],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            { tsconfig: './tsconfig.dev.json' },
        ],
    }
};

export default CONFIG;
