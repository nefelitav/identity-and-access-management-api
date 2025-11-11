import { Response } from "express";
import { SessionService } from "~/services";
import {
  ListSessionsRequest,
  ListSessionsResponse,
  DeleteSessionRequest,
  DeleteSessionResponse,
  DeleteAllSessionsRequest,
  DeleteAllSessionsResponse,
} from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
import { BaseController } from "~/controllers";

const logger = createLogger("SessionController");

export class SessionController extends BaseController {
  static async listSessions(
    req: ListSessionsRequest,
    res: Response<ListSessionsResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId;
        const sessions = await SessionService.getSessions(userId);

        logger.info(`Fetched ${sessions.length} sessions for user: ${userId}`);

        return {
          sessions: sessions.map((session) => ({
            id: session.id,
            userId: session.userId,
            userAgent: session.userAgent,
            ip: session.ipAddress,
            createdAt: session.createdAt.toISOString(),
            lastActiveAt: session.lastActiveAt.toISOString(),
          })),
        };
      },
      ResponseCode.OK,
    );
  }

  static async deleteSession(
    req: DeleteSessionRequest,
    res: Response<DeleteSessionResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { sessionId } = req.body.params;
        await SessionService.deleteSession(sessionId);

        logger.info(`Deleted session with ID: ${sessionId}`);
        return { message: "Session deleted" };
      },
      ResponseCode.OK,
    );
  }

  static async deleteAllSessions(
    req: DeleteAllSessionsRequest,
    res: Response<DeleteAllSessionsResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId;
        await SessionService.deleteAllSessions(userId);

        logger.info(`Deleted all sessions for user: ${userId}`);
        return { message: "All sessions deleted" };
      },
      ResponseCode.OK,
    );
  }
}
