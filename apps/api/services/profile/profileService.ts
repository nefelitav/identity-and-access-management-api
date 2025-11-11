import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { UserNotFoundException } from "~/exceptions";
import { SessionService } from "~/services";
import { SALT, sendEmail, generateTokens } from "~/utils";
import redisClient from "~/utils/redis";

export class ProfileService {
  static async updateProfile({
    userId,
    email,
    password,
    userAgent,
    ip,
  }: {
    userId?: string;
    email?: string;
    password?: string;
    userAgent?: string;
    ip?: string;
  }) {
    if (!userId) {
      throw UserNotFoundException;
    }

    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    const user = await userRepository.findById(userId);
    if (!user) {
      throw UserNotFoundException;
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, SALT);
    }

    const updatedUser = await userRepository.update(userId, updateData);

    const tokens = await generateTokens(updatedUser.id, userAgent, ip);

    return {
      ...updatedUser,
      updatedAt: updatedUser.updatedAt.toISOString(),
      ...tokens,
    };
  }

  static async deleteUser(userId?: string) {
    if (!userId) throw UserNotFoundException;

    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    await userRepository.delete(userId);

    await SessionService.deleteAllSessions(userId);
  }

  static async requestPasswordReset(email: string) {
    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    const user = await userRepository.findByEmail(email);
    if (!user) throw UserNotFoundException;

    const token = await ProfileService.generateResetToken(user.id);
    const resetUrl = `https://yourfrontend.com/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `To reset your password, click: ${resetUrl}`,
    });
  }

  static async resetPassword(resetToken: string, newPassword: string) {
    const userId = await ProfileService.verifyResetToken(resetToken);
    if (!userId) throw UserNotFoundException;

    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    const hashedPassword = await bcrypt.hash(newPassword, SALT);

    await userRepository.update(userId, {
      password: hashedPassword,
    });

    await ProfileService.invalidateResetToken(resetToken);
  }

  static async getUser(userId?: string) {
    if (!userId) throw UserNotFoundException;

    const userRepository = container.get<UserRepository>(
      SERVICE_IDENTIFIERS.UserRepository,
    );
    const user = await userRepository.findById(userId);
    if (!user) throw UserNotFoundException;

    return user;
  }

  private static async generateResetToken(userId: string) {
    const token = uuidv4();
    await redisClient.set(`passwordReset:${token}`, userId);
    return token;
  }

  private static async verifyResetToken(token: string): Promise<string | null> {
    return await redisClient.get(`passwordReset:${token}`);
  }

  private static async invalidateResetToken(token: string) {
    await redisClient.del(`passwordReset:${token}`);
  }
}
