process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  "test-jwt-secret-key-that-is-at-least-32-characters-long";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://user:password@localhost:5432/test_db";
process.env.REDIS_URL = "redis://localhost:6379";

beforeAll(async () => {
  await testContainer.setup();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(async () => {
  await testContainer.cleanup();
});

afterAll(async () => {
  (console.error as jest.Mock).mockRestore();
  await testContainer.teardown();
});

jest.setTimeout(30000);

import { testContainer } from "./testSetup";
