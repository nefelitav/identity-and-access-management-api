import { Response } from "express";
import { OtpService } from "~/services";
import { OtpInEmailRequest, OtpInSmsRequest, OtpVerifyRequest } from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
import { BaseController } from "~/controllers";
import { InvalidOtpTokenException } from "~/exceptions";

const logger = createLogger("OtpController");

export class OtpController extends BaseController {
  static async requestCodeInEmail(req: OtpInEmailRequest, res: Response) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, email } = req.body;
        await OtpService.generateAndSendCodeViaEmail(userId, email);

        logger.info(`OTP email code sent to ${email} for user: ${userId}`);
        return { message: "Verification code sent" };
      },
      ResponseCode.OK,
    );
  }

  static async requestCodeInSms(req: OtpInSmsRequest, res: Response) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, phone } = req.body;
        await OtpService.generateAndSendCodeViaSms(userId, phone);

        logger.info(`OTP SMS code sent to ${phone} for user: ${userId}`);
        return { message: "Verification code sent" };
      },
      ResponseCode.OK,
    );
  }

  static async verifyCode(req: OtpVerifyRequest, res: Response) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, code } = req.body;
        const isValid = await OtpService.verifyCode(userId, code);

        if (!isValid) {
          logger.warn(`OTP verification failed for user: ${userId}`);
          throw InvalidOtpTokenException();
        }

        logger.info(`OTP verification succeeded for user: ${userId}`);
        return { isValid };
      },
      ResponseCode.OK,
    );
  }
}
