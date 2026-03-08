import bcrypt from "bcryptjs";
import crypto from "crypto";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { UserNotFoundException } from "~/exceptions";
import { createSessionService } from "~/services/session/sessionService";
import { SALT, sendEmail } from "~/utils";
import { config } from "~/config";
import redisClient from "~/utils/redis";

function getUserRepository() {
  return container.get<UserRepository>(SERVICE_IDENTIFIERS.UserRepository);
}

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

export async function deleteUser(userId?: string) {
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  await userRepository.delete(userId);

  const sessionService = createSessionService();
  await sessionService.deleteAllSessions(userId);
}

export async function requestPasswordReset(email: string) {
  const userRepository = getUserRepository();
  const user = await userRepository.findByEmail(email);
  if (!user) throw UserNotFoundException();

  const token = await generateResetToken(user.id);
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Password Reset Request",
    text: `To reset your password, click: ${resetUrl}`,
  });
}

export async function resetPassword(resetToken: string, newPassword: string) {
  const userId = await verifyResetToken(resetToken);
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  const hashedPassword = await bcrypt.hash(newPassword, SALT);

  await userRepository.update(userId, { password: hashedPassword });
  await invalidateResetToken(resetToken);
}

export async function getUser(userId?: string) {
  if (!userId) throw UserNotFoundException();

  const userRepository = getUserRepository();
  const user = await userRepository.findById(userId);
  if (!user) throw UserNotFoundException();

  return user;
}

async function generateResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await redisClient.setEx(`passwordReset:${token}`, 3600, userId);
  return token;
}

async function verifyResetToken(token: string): Promise<string | null> {
  return await redisClient.get(`passwordReset:${token}`);
}

async function invalidateResetToken(token: string) {
  await redisClient.del(`passwordReset:${token}`);
}
