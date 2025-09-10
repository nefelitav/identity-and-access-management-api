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
import {
  generateTokens,
  JWT_EXPIRY,
  JWT_SECRET,
  SALT,
  sendEmail,
} from "~/utils";
import { PrismaClient } from "@prisma/client";
import { AccountLockedException } from "~/exceptions/AccountLockedException";

const prisma = new PrismaClient();

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
    remember = false,
  }: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
    remember?: boolean;
  }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw InvalidCredentialsException();
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw AccountLockedException(user.lockoutUntil);
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;

      let lockoutUntil: Date | null = null;
      const MAX_ATTEMPTS = 5;
      const LOCKOUT_DURATION = 15;

      if (failedAttempts >= MAX_ATTEMPTS) {
        lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockoutUntil,
        },
      });

      throw InvalidCredentialsException();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });

    const knownSession = await prisma.session.findFirst({
      where: { userId: user.id, userAgent, ipAddress: ip },
    });

    if (!knownSession) {
      await sendEmail({
        to: (await prisma.user.findUnique({ where: { id: user.id } }))!.email,
        subject: "Security Alert: New Login Detected",
        text: `Hi,
      We detected a login to your account from a new device or location.
      
      Details:
      IP Address: ${ip}
      Device/Browser: ${userAgent}
      
      If this was you, no action is needed.
      If you did NOT authorize this login, please reset your password immediately and review your account's active sessions.
      
      Stay safe,
      Auth Forge Security Team`,
        html: `<p>Hi,</p>
      <p>We detected a login to your account from a new device or location.</p>
      <p><strong>Details:</strong><br>
      IP Address: ${ip}<br>
      Device/Browser: ${userAgent}</p>
      <p>If this was you, no action is needed.<br>
      If you did NOT authorize this login, please <a href="https://yourapp.com/reset-password">reset your password</a> immediately and review your account's active sessions.</p>
      <p>Stay safe,<br>Auth Forge Security Team</p>`,
      });
    }

    return generateTokens(user.id, userAgent, ip, remember);
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
