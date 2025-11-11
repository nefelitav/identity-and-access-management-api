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
        const result = await CaptchaService.verify(token);
        logger.info("Captcha verified successfully.");
        return result;
      },
      ResponseCode.OK,
    );
  }
}
