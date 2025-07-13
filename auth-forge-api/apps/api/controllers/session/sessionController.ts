import { Response } from 'express';
import { SessionService } from '~/services';
import {
    ListSessionsRequest,
    ListSessionsResponse,
    DeleteSessionRequest,
    DeleteSessionResponse,
    DeleteAllSessionsRequest,
    DeleteAllSessionsResponse,
} from '~/dtos';
import { createLogger, ResponseCode } from '~/utils';

const logger = createLogger('SessionController');

export class SessionController {
    static async listSessions(req: ListSessionsRequest, res: Response<ListSessionsResponse>) {
        try {
            const userId = req.user?.id;

            const sessions = await SessionService.getSessions(userId);
            logger.info(`Fetched ${sessions.length} sessions.`);

            res.status(ResponseCode.OK).json({
                success: true,
                data: sessions.map(session => ({
                    id: session.id,
                    userId: session.userId,
                    userAgent: session.userAgent,
                    ip: session.ipAddress,
                    createdAt: session.createdAt.toISOString(),
                    lastActiveAt: session.lastActiveAt.toISOString(),
                })),
            });
        } catch (err: any) {
            logger.error('Fetching sessions failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async deleteSession(req: DeleteSessionRequest, res: Response<DeleteSessionResponse>) {
        try {
            const { sessionId } = req.body.params;

            await SessionService.deleteSession(sessionId);
            logger.info(`Deleted session.`);

            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            logger.error('Deleting session failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async deleteAllSessions(
        req: DeleteAllSessionsRequest,
        res: Response<DeleteAllSessionsResponse>,
    ) {
        try {
            const userId = req.user?.id;

            await SessionService.deleteAllSessions(userId);
            logger.info(`Deleted all sessions.`);

            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            logger.error('Deleting sessions failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }
}
