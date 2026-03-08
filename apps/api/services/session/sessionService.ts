import { UserNotFoundException } from "~/exceptions";
import { hashToken } from "~/utils";
import { v4 as uuidv4 } from "uuid";
import { SessionRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

function getSessionRepository() {
  return container.get<SessionRepository>(
    SERVICE_IDENTIFIERS.SessionRepository,
  );
}

export function createSessionService() {
  const sessionRepository = getSessionRepository();

  return {
    createSession: async (
      userId: string,
      refreshToken: string,
      userAgent?: string,
      ipAddress?: string,
      expiresIn = 60 * 60 * 24 * 7,
    ) => {
      const hashedToken = hashToken(refreshToken);
      return await sessionRepository.create({
        id: uuidv4(),
        userId,
        refreshToken: hashedToken,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      });
    },

    getSessionByToken: async (refreshToken: string) => {
      const hashedToken = hashToken(refreshToken);
      return await sessionRepository.findByToken(hashedToken);
    },

    getSessions: async (userId?: string) => {
      if (!userId) throw UserNotFoundException();
      return await sessionRepository.findAll(userId);
    },

    deleteSession: async (sessionId: string) => {
      const session = await sessionRepository.findById(sessionId);
      if (!session) return;
      return await sessionRepository.delete(sessionId);
    },

    deleteAllSessions: async (userId?: string) => {
      if (!userId) throw UserNotFoundException();
      return await sessionRepository.deleteAll(userId);
    },

    updateLastActive: async (sessionId: string) => {
      return await sessionRepository.updateLastActive(sessionId);
    },
  };
}

export const SessionService = {
  createSession: (
    ...args: Parameters<
      ReturnType<typeof createSessionService>["createSession"]
    >
  ) => createSessionService().createSession(...args),
  getSessionByToken: (
    ...args: Parameters<
      ReturnType<typeof createSessionService>["getSessionByToken"]
    >
  ) => createSessionService().getSessionByToken(...args),
  getSessions: (
    ...args: Parameters<ReturnType<typeof createSessionService>["getSessions"]>
  ) => createSessionService().getSessions(...args),
  deleteSession: (
    ...args: Parameters<
      ReturnType<typeof createSessionService>["deleteSession"]
    >
  ) => createSessionService().deleteSession(...args),
  deleteAllSessions: (
    ...args: Parameters<
      ReturnType<typeof createSessionService>["deleteAllSessions"]
    >
  ) => createSessionService().deleteAllSessions(...args),
  updateLastActive: (
    ...args: Parameters<
      ReturnType<typeof createSessionService>["updateLastActive"]
    >
  ) => createSessionService().updateLastActive(...args),
};
