import { handleRequest } from "~/controllers/base/baseController";
import { createSessionService } from "~/services/session/sessionService";
import { createLogger } from "~/utils";

const logger = createLogger("SessionController");

/** List all active sessions for the authenticated user. */
export const listSessionsHandler = handleRequest(async (req) => {
  const userId = req.user?.userId;
  const sessionService = createSessionService();
  const sessions = await sessionService.getSessions(userId);

  logger.info(`Fetched ${sessions.length} sessions for user: ${userId}`);
  return {
    sessions: sessions.map((session: any) => ({
      id: session.id,
      userId: session.userId,
      userAgent: session.userAgent,
      ip: session.ipAddress,
      createdAt: session.createdAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
    })),
  };
});

/** Delete a specific session by ID. */
export const deleteSessionHandler = handleRequest(async (req) => {
  const { sessionId } = req.body.params;
  const sessionService = createSessionService();
  await sessionService.deleteSession(sessionId);

  logger.info(`Deleted session with ID: ${sessionId}`);
  return { message: "Session deleted" };
});

/** Delete all sessions for the authenticated user. */
export const deleteAllSessionsHandler = handleRequest(async (req) => {
  const userId = req.user?.userId;
  const sessionService = createSessionService();
  await sessionService.deleteAllSessions(userId);

  logger.info(`Deleted all sessions for user: ${userId}`);
  return { message: "All sessions deleted" };
});
