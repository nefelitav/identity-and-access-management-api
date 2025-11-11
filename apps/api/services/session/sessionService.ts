import { UserNotFoundException } from "~/exceptions";
import { hashToken } from "~/utils";
import { v4 as uuidv4 } from "uuid";
import { SessionRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

export class SessionService {
  private static get sessionRepository() {
    return container.get<SessionRepository>(
      SERVICE_IDENTIFIERS.SessionRepository,
    );
  }
  static async createSession(
    userId: string,
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string,
    expiresIn = 60 * 60 * 24 * 7,
  ) {
    const hashedToken = hashToken(refreshToken);

    return await this.sessionRepository.create({
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
    return await this.sessionRepository.findByToken(hashedToken);
  }

  static async getSessions(userId?: string) {
    if (!userId) throw UserNotFoundException;
    return await this.sessionRepository.findAll(userId);
  }

  static async deleteSession(sessionId: string) {
    return await this.sessionRepository.delete(sessionId);
  }

  static async deleteAllSessions(userId?: string) {
    if (!userId) throw UserNotFoundException;

    return await this.sessionRepository.deleteAll(userId);
  }

  static async updateLastActive(sessionId: string) {
    return await this.sessionRepository.updateLastActive(sessionId);
  }
}
