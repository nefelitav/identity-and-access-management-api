import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository, TotpRepository } from "~/repositories";
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
import { config } from "~/config";
import redisClient from "~/utils/redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

function getUserRepository() {
  return container.get<UserRepository>(SERVICE_IDENTIFIERS.UserRepository);
}

function getTotpRepository() {
  return container.get<TotpRepository>(SERVICE_IDENTIFIERS.TotpRepository);
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

    try {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      await redisClient.setEx(
        `emailVerify:${verificationToken}`,
        86400,
        user.id,
      );

      const verifyUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: email,
        subject: "Verify your email",
        text: `Welcome! Please verify your email by clicking: ${verifyUrl}`,
        html: `<p>Welcome!</p><p>Please verify your email by clicking: <a href="${verifyUrl}">Verify Email</a></p>`,
      });
    } catch {
      // Verification email is best-effort; user can request a resend later
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: false,
      createdAt: user.createdAt.toISOString(),
      ...tokens,
    };
  });
}

export async function verifyEmail(token: string) {
  const userId = await redisClient.get(`emailVerify:${token}`);
  if (!userId) throw InvalidCredentialsException();

  const userRepository = getUserRepository();
  const user = await userRepository.findById(userId);
  if (!user) throw UserNotFoundException();

  await userRepository.update(userId, { emailVerified: true });
  await redisClient.del(`emailVerify:${token}`);

  return { message: "Email verified successfully" };
}

export async function resendVerificationEmail(userId: string) {
  const userRepository = getUserRepository();
  const user = await userRepository.findById(userId);
  if (!user) throw UserNotFoundException();

  if (user.emailVerified) {
    return { message: "Email already verified" };
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  await redisClient.setEx(`emailVerify:${verificationToken}`, 86400, user.id);

  const verifyUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Please verify your email by clicking: ${verifyUrl}`,
    html: `<p>Please verify your email by clicking: <a href="${verifyUrl}">Verify Email</a></p>`,
  });

  return { message: "Verification email sent" };
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

    // Check if user has MFA enabled — if so, return a short-lived challenge token
    const totpRepo = getTotpRepository();
    const mfaSecret = await totpRepo.getSecretByUserId(user.id);

    if (mfaSecret?.enabled) {
      const mfaToken = jwt.sign(
        {
          userId: user.id,
          purpose: "mfa-challenge",
          iss: "identity-forge-api",
          aud: "identity-forge-client",
        },
        JWT_SECRET,
        { expiresIn: 300, algorithm: "HS256" }, // 5 minutes
      );

      return {
        mfaRequired: true,
        mfaToken,
      };
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

export async function verifyMfaLogin({
  mfaToken,
  code,
  userAgent,
  ip,
}: {
  mfaToken: string;
  code: string;
  userAgent?: string;
  ip?: string;
}) {
  let payload: any;
  try {
    payload = jwt.verify(mfaToken, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "identity-forge-api",
      audience: "identity-forge-client",
    });
  } catch {
    throw InvalidCredentialsException();
  }

  if (payload.purpose !== "mfa-challenge" || !payload.userId) {
    throw InvalidCredentialsException();
  }

  const { verifyCode } = await import("~/services/mfa/totpService");
  const isValid = await verifyCode(payload.userId, code);
  if (!isValid) {
    throw InvalidCredentialsException();
  }

  return generateTokens(payload.userId, userAgent, ip);
}
