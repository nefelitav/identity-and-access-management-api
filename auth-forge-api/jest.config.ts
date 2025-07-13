import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@repo/prisma$': '<rootDir>/packages/prisma',
        '^~/(.*)$': '<rootDir>/apps/api/$1',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/apps/api/tsconfig.json',
        },
    },
};

export default config;
