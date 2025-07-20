import { hashToken } from "~/utils";
import { v4 as uuidv4 } from "uuid";
import { sessionRepository } from "~/repositories";
import { UserNotFoundException } from "~/exceptions";

export class SessionService {
  static async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
    expiresIn = 60 * 60 * 24 * 7,
  ) {
    const hashedToken = hashToken(refreshToken);

    return await sessionRepository.create({
      id: uuidv4(),
      userId,
      refreshToken: hashedToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });
  }

  static async getSessionByToken(refreshToken: string) {
    const hashedToken = hashToken(refreshToken);
    return await sessionRepository.findByToken(hashedToken);
  }

  static async getSessions(userId?: string) {
    if (!userId) throw UserNotFoundException;
    return await sessionRepository.findAll(userId);
  }

  static async deleteSession(sessionId: string) {
    return await sessionRepository.delete(sessionId);
  }

  static async deleteAllSessions(userId?: string) {
    if (!userId) throw UserNotFoundException;

    return await sessionRepository.deleteAll(userId);
  }

  static async updateLastActive(sessionId: string) {
    return await sessionRepository.updateLastActive(sessionId);
  }
}
