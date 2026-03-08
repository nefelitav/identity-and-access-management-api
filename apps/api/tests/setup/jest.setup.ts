process.env.NODE_ENV = "test";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:test_password@localhost:5433/identity_forge_test";
}
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-key-that-is-long-enough-for-tests";
process.env.SESSION_SECRET =
  process.env.SESSION_SECRET || "test-session-secret-key-long-enough";
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = "redis://localhost:6380";
}
process.env.PORT = process.env.PORT || "3000";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

process.env.SMTP_HOST = "";
delete process.env.TWILIO_ACCOUNT_SID;
