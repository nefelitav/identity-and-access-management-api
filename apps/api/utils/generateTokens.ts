import { v4 as uuidv4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_EXPIRY, JWT_SECRET } from "~/utils";
import { SessionService } from "~/services";
import { createLogger } from "~/utils";

const logger = createLogger("TokenGenerator");

export async function generateTokens(
  userId: string,
  userAgent?: string,
  ip?: string,
  remember = false,
) {
  const refreshToken = uuidv4();

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload: JwtPayload = {
    userId,
    sessionId: refreshToken,
    sub: userId,
    iss: "identity-forge-api",
    aud: "identity-forge-client",
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
  });

  const expiresIn = remember
    ? 30 * 24 * 60 * 60 // 30 days
    : 7 * 24 * 60 * 60; // 7 days

  try {
    await SessionService.createSession(
      userId,
      refreshToken,
      userAgent,
      ip,
      expiresIn,
    );

    logger.debug("Tokens generated successfully for " + userId);
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error(
      "Failed to create session during token generation:",
      error as Error,
    );
    throw error;
  }
}
