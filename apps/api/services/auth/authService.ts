import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "~/repositories";
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UserNotFoundException,
} from "~/exceptions";
import { SessionService } from "~/services";
import { generateTokens, JWT_EXPIRY, JWT_SECRET, SALT } from "~/utils";

export class AuthService {
  static async register({
    email,
    password,
    userAgent,
    ip,
  }: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }) {
    const userExists = await UserRepository.existsByEmail(email);
    if (userExists) throw EmailAlreadyInUseException(email);

    const hashedPassword = await bcrypt.hash(password, SALT);
    const user = await UserRepository.create({
      email,
      password: hashedPassword,
    });

    const tokens = await generateTokens(user.id, userAgent, ip);

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      ...tokens,
    };
  }

  static async login({
    email,
    password,
    userAgent,
    ip,
  }: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw InvalidCredentialsException();
    }

    return generateTokens(user.id, userAgent, ip);
  }

  static async logout({
    sessionId,
    userId,
  }: {
    sessionId?: string;
    userId?: string;
  }) {
    if (!sessionId || !userId) {
      throw UserNotFoundException;
    }

    if (sessionId) {
      await SessionService.deleteSession(sessionId);
    } else if (userId) {
      await SessionService.deleteAllSessions(userId);
    }
  }

  static async refreshToken(refreshToken: string) {
    let payload: { userId: string; [key: string]: any };
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET!) as { userId: string };
    } catch {
      throw InvalidRefreshTokenException;
    }

    const session = await SessionService.getSessionByToken(refreshToken);
    if (!session) {
      throw InvalidRefreshTokenException;
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw InvalidRefreshTokenException;
    }

    await SessionService.updateLastActive(session.id);

    const newAccessToken = jwt.sign({ userId: payload.userId }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRY,
    });

    return { accessToken: newAccessToken };
  }
}
