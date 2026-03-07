import jwt from "jsonwebtoken";

const TEST_JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-key-that-is-long-enough-for-tests";

/**
 * Mint a valid access token matching authMiddleware verification expectations.
 */
export function createValidToken(
  userId = "test-user-id",
  sessionId = "test-session-id",
  expiresInSec = 3600,
): string {
  return jwt.sign(
    {
      userId,
      sessionId,
      sub: userId,
      iss: "identity-forge-api",
      aud: "identity-forge-client",
      iat: Math.floor(Date.now() / 1000),
    },
    TEST_JWT_SECRET as string,
    { expiresIn: expiresInSec, algorithm: "HS256" },
  );
}

/**
 * Mint an expired token (for negative-path tests).
 */
export function createExpiredToken(
  userId = "test-user-id",
  sessionId = "test-session-id",
): string {
  const pastExp = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
  return jwt.sign(
    {
      userId,
      sessionId,
      sub: userId,
      iss: "identity-forge-api",
      aud: "identity-forge-client",
      exp: pastExp,
    },
    TEST_JWT_SECRET as string,
    { algorithm: "HS256" },
  );
}

/**
 * Return the Authorization header value.
 */
export function bearerHeader(token: string): string {
  return `Bearer ${token}`;
}
