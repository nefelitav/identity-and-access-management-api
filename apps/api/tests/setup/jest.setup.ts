/** Global test setup – runs before all test suites. */

// Silence the custom logger during tests
process.env.NODE_ENV = "test";

// Provide required environment variables for envalid config validation
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-key-that-is-long-enough-for-tests";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || "test-session-secret-key-long-enough";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
process.env.PORT = process.env.PORT || "3000";
