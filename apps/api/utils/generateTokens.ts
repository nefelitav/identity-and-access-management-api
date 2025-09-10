import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { JWT_EXPIRY, JWT_SECRET } from "~/utils/constants";
import { SessionService } from "~/services";

export async function generateTokens(
  userId: string,
  userAgent?: string,
  ip?: string,
  remember = false,
) {
  const refreshToken = uuidv4();
  const accessToken = jwt.sign(
    { userId, sessionId: refreshToken },
    JWT_SECRET!,
    {
      expiresIn: JWT_EXPIRY,
    },
  );

  const expiresIn = remember
    ? 30 * 24 * 60 * 60 // 30 days
    : 7 * 24 * 60 * 60; // 7 days

  await SessionService.createSession(
    userId,
    refreshToken,
    userAgent,
    ip,
    expiresIn,
  );

  return { accessToken, refreshToken };
}
