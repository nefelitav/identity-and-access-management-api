import { Response } from 'express';
import { CaptchaVerificationRequest, CaptchaVerificationResponse } from '~/dtos';
import { CaptchaService } from '~/services';
import { createLogger, ResponseCode } from '~/utils';

const logger = createLogger('CaptchaController');

export class CaptchaController {
    static async verify(
        req: CaptchaVerificationRequest,
        res: Response<CaptchaVerificationResponse>,
    ): Promise<void> {
        try {
            const { token } = req.body;
            const result = await CaptchaService.verify(token);
            logger.info(`Captcha verified successfully.`);
            res.status(ResponseCode.OK).json({ success: true, data: result });
        } catch (err: any) {
            logger.error('Failed to verify captcha', err);

            res.status(err.statusCode).json({
                success: false,
                error: { message: err.message },
            });
        }
    }
}
