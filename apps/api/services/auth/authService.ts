import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
  UserNotFoundException,
  AccountLockedException,
  InvalidRefreshTokenException,
} from "~/exceptions";
import { createSessionService } from "~/services/session/sessionService";
import {
  generateTokens,
  JWT_EXPIRY,
  JWT_SECRET,
  SALT,
  sendEmail,
} from "~/utils";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

function getUserRepository() {
  return container.get<UserRepository>(SERVICE_IDENTIFIERS.UserRepository);
}

export async function register({
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
  const userRepository = getUserRepository();

  return await userRepository.withTransaction(async () => {
    const userExists = await userRepository.existsByEmail(email);
    if (userExists) throw EmailAlreadyInUseException(email);

    const hashedPassword = await bcrypt.hash(password, SALT);
    const user = await userRepository.create({
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
  });
}

export async function login({
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
  const userRepository = getUserRepository();

  return await userRepository.withTransaction(async (tx) => {
    const user = await userRepository.findByEmail(email);
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
      if (failedAttempts >= MAX_ATTEMPTS) {
        lockoutUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
      }

      await userRepository.updateFailedAttempts(
        user.id,
        failedAttempts,
        lockoutUntil,
      );
      throw InvalidCredentialsException();
    }

    await userRepository.resetFailedAttempts(user.id);

    const knownSession = await tx.session.findFirst({
      where: { userId: user.id, userAgent, ipAddress: ip },
    });

    if (!knownSession) {
      await sendEmail({
        to: user.email,
        subject: "Security Alert: New Login Detected",
        text: `Hi,
          We detected a login to your account from a new device or location.

          Details:
          IP Address: ${ip}
          Device/Browser: ${userAgent}

          If this was you, no action is needed.
          If you did NOT authorize this login, please reset your password immediately and review your account's active sessions.

          Stay safe,
          Identity Forge Security Team`,
        html: `<p>Hi,</p>
          <p>We detected a login to your account from a new device or location.</p>
          <p><strong>Details:</strong><br>
          IP Address: ${ip}<br>
          Device/Browser: ${userAgent}</p>
          <p>If this was you, no action is needed.<br>
          If you did NOT authorize this login, please reset your password immediately and review your account's active sessions.</p>
          <p>Stay safe,<br>Identity Forge Security Team</p>`,
      });
    }

    return generateTokens(user.id, userAgent, ip, remember);
  });
}

export async function logout({
  sessionId,
  userId,
}: {
  sessionId?: string;
  userId?: string;
}) {
  const sessionService = createSessionService();

  if (!sessionId && !userId) {
    throw UserNotFoundException();
  }

  if (sessionId) {
    await sessionService.deleteSession(sessionId);
  } else if (userId) {
    await sessionService.deleteAllSessions(userId);
  }
}

export async function refreshToken(refreshTokenValue: string) {
  const sessionService = createSessionService();

  const session = await sessionService.getSessionByToken(refreshTokenValue);
  if (!session) throw InvalidRefreshTokenException();

  if (session.expiresAt.getTime() < Date.now()) {
    throw InvalidRefreshTokenException();
  }

  await sessionService.updateLastActive(session.id);

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const newAccessToken = jwt.sign(
    {
      userId: session.userId,
      sessionId: session.id,
      sub: session.userId,
      iss: "identity-forge-api",
      aud: "identity-forge-client",
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      algorithm: "HS256",
    },
  );

  return { accessToken: newAccessToken };
}
