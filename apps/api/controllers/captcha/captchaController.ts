import { Response } from "express";
import {
  CaptchaVerificationRequest,
  CaptchaVerificationResponse,
} from "~/dtos";
import { CaptchaService } from "~/services";
import { createLogger, ResponseCode } from "~/utils";
import { BaseController } from "~/controllers";

const logger = createLogger("CaptchaController");

export class CaptchaController extends BaseController {
  static async verify(
    req: CaptchaVerificationRequest,
    res: Response<CaptchaVerificationResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { token } = req.body;

        const captchaService = new CaptchaService(logger);
        const result = await captchaService.verifyCaptcha(token, req.ip);

        logger.info("Captcha verified successfully.");
        return {
          success: result.success,
          score: result.score,
        };
      },
      ResponseCode.OK,
    );
  }
}
