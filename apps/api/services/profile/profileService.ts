import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { UserNotFoundException } from "~/exceptions";
import { createSessionService } from "~/services/session/sessionService";
import { SALT, sendEmail } from "~/utils";
import redisClient from "~/utils/redis";

function getUserRepository() {
  return container.get<UserRepository>(SERVICE_IDENTIFIERS.UserRepository);
}

/** Update a user's profile (email / password). */
export async function updateProfile({
  userId,
  email,
  password,
}: {
  userId?: string;
  email?: string;
  password?: string;
}) {
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  const user = await userRepository.findById(userId);
  if (!user) throw UserNotFoundException();

  // Check email uniqueness before updating
  if (email && email !== user.email) {
    const exists = await userRepository.existsByEmail(email);
    if (exists) {
      const { EmailAlreadyInUseException } = await import("~/exceptions");
      throw EmailAlreadyInUseException(email);
    }
  }

  const updateData: any = {};
  if (email) updateData.email = email;
  if (password) {
    updateData.password = await bcrypt.hash(password, SALT);
  }

  const updatedUser = await userRepository.update(userId, updateData);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    updatedAt: updatedUser.updatedAt.toISOString(),
  };
}

/** Delete a user and all their sessions. */
export async function deleteUser(userId?: string) {
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  await userRepository.delete(userId);

  const sessionService = createSessionService();
  await sessionService.deleteAllSessions(userId);
}

/** Send a password-reset email with a unique token. */
export async function requestPasswordReset(email: string) {
  const userRepository = getUserRepository();
  const user = await userRepository.findByEmail(email);
  if (!user) throw UserNotFoundException();

  const token = await generateResetToken(user.id);
  const resetUrl = `https://yourfrontend.com/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    text: `To reset your password, click: ${resetUrl}`,
  });
}

/** Reset a user's password using a valid reset token. */
export async function resetPassword(resetToken: string, newPassword: string) {
  const userId = await verifyResetToken(resetToken);
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  const hashedPassword = await bcrypt.hash(newPassword, SALT);

  await userRepository.update(userId, { password: hashedPassword });
  await invalidateResetToken(resetToken);
}

/** Fetch a user by ID. */
export async function getUser(userId?: string) {
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  const user = await userRepository.findById(userId);
  if (!user) throw UserNotFoundException();

  return user;
}

// ── Internal helpers ──────────────────────────────────────────────

async function generateResetToken(userId: string) {
  const token = uuidv4();
  await redisClient.setEx(`passwordReset:${token}`, 3600, userId); // 1-hour TTL
  return token;
}

async function verifyResetToken(token: string): Promise<string | null> {
  return await redisClient.get(`passwordReset:${token}`);
}

async function invalidateResetToken(token: string) {
  await redisClient.del(`passwordReset:${token}`);
}
