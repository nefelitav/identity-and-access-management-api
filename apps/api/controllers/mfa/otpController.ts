import { Response } from "express";
import { OtpService } from "~/services";
import { OtpInEmailRequest, OtpInSmsRequest, OtpVerifyRequest } from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
const logger = createLogger("TotpController");

export class OtpController {
  static async requestCodeInEmail(req: OtpInEmailRequest, res: Response) {
    try {
      const { userId, email } = req.body;
      await OtpService.generateAndSendCodeViaEmail(userId, email);

      logger.info(`OTP email code sent to ${email} for user: ${userId}`);
      res
        .status(ResponseCode.OK)
        .json({ success: true, data: { message: "Verification code sent" } });
    } catch (err: any) {
      logger.error("Failed to send OTP email code", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }

  static async requestCodeInSms(req: OtpInSmsRequest, res: Response) {
    try {
      const { userId, phone } = req.body;
      await OtpService.generateAndSendCodeViaSms(userId, phone);

      logger.info(`OTP SMS code sent to ${phone} for user: ${userId}`);
      res
        .status(ResponseCode.OK)
        .json({ success: true, data: { message: "Verification code sent" } });
    } catch (err: any) {
      logger.error("Failed to send OTP SMS code", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }

  static async verifyCode(req: OtpVerifyRequest, res: Response) {
    try {
      const { userId, code } = req.body;
      const isValid = await OtpService.verifyCode(userId, code);

      if (isValid) {
        logger.info(`OTP verification succeeded for user: ${userId}`);
        res.status(ResponseCode.OK).json({ success: true, data: { isValid } });
      } else {
        logger.warn(`OTP verification failed for user: ${userId}`);
        res
          .status(ResponseCode.BAD_REQUEST)
          .json({ success: false, error: { message: "Invalid code" } });
      }
    } catch (err: any) {
      logger.error("Failed to verify OTP code", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }
}
