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

  const expiresIn = remember
    ? 30 * 24 * 60 * 60 // 30 days
    : 7 * 24 * 60 * 60; // 7 days

  try {
    const session = await SessionService.createSession(
      userId,
      refreshToken,
      userAgent,
      ip,
      expiresIn,
    );

    const payload: JwtPayload = {
      userId,
      sessionId: session.id, // use actual DB session ID, not the raw refresh token
      sub: userId,
      iss: "identity-forge-api",
      aud: "identity-forge-client",
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: "HS256",
    });

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
