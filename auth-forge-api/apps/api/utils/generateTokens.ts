import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRY, JWT_SECRET } from '~/utils/constants';
import { SessionService } from '~/services';

export async function generateTokens(userId: string, userAgent?: string, ip?: string) {
    const refreshToken = uuidv4();
    const accessToken = jwt.sign({ userId, sessionId: refreshToken }, JWT_SECRET!, {
        expiresIn: JWT_EXPIRY,
    });

    await SessionService.createSession(userId, refreshToken, userAgent, ip);

    return { accessToken, refreshToken };
}
