import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@repo/prisma$": "<rootDir>/packages/prisma",
    "^~/(.*)$": "<rootDir>/apps/api/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/apps/api/tests/setup/testSetup.ts"],
  rootDir: ".",
  roots: ["<rootDir>/apps/api/tests"],
  verbose: true,
  clearMocks: true,
  passWithNoTests: true,
  globalSetup: "<rootDir>/apps/api/tests/setup/globalSetup.ts",
};

export default config;
