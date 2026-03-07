import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/apps/api"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  setupFiles: ["<rootDir>/apps/api/tests/setup/jest.setup.ts"],
  moduleNameMapper: {
    "^@repo/prisma$": "<rootDir>/packages/prisma",
    "^~/(.*)$": "<rootDir>/apps/api/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/apps/api/tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: [
    "apps/api/**/*.ts",
    "!apps/api/**/*.d.ts",
    "!apps/api/**/*.test.ts",
    "!apps/api/**/*.spec.ts",
    "!apps/api/tests/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testTimeout: 15000,
  verbose: true,
};

export default config;
