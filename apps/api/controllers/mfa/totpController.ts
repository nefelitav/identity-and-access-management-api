import { Response } from "express";
import { TotpService } from "~/services";
import {
  TotpConfirmRequest,
  TotpDisableRequest,
  TotpEnableRequest,
  TotpVerifyRequest,
} from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
const logger = createLogger("TotpController");

export class TotpController {
  static async enable(req: TotpEnableRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      const { secret, qrCode } = await TotpService.generateSecret(userId);

      logger.info(`TOTP secret generated for user: ${userId}`);
      res
        .status(ResponseCode.CREATED)
        .json({ success: true, data: { secret, qrCode } });
    } catch (err: any) {
      logger.error("Failed to enable TOTP", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }

  static async confirmAndEnable(
    req: TotpConfirmRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { userId, token } = req.body;
      const success = await TotpService.confirmAndEnable(userId, token);

      if (success) {
        logger.info(`TOTP confirmed and enabled for user: ${userId}`);
        res.status(ResponseCode.OK).json({ success: true, data: { success } });
      } else {
        logger.warn(`Invalid TOTP token for user: ${userId}`);
        res
          .status(ResponseCode.BAD_REQUEST)
          .json({ success: false, error: { message: "Invalid token" } });
      }
    } catch (err: any) {
      logger.error("Failed to confirm TOTP enable", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }

  static async verify(req: TotpVerifyRequest, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;
      const isValid = await TotpService.verifyCode(userId, token);

      if (isValid) {
        logger.info(`TOTP verification succeeded for user: ${userId}`);
        res.status(ResponseCode.OK).json({ success: true, data: { isValid } });
      } else {
        logger.warn(`TOTP verification failed for user: ${userId}`);
        res
          .status(ResponseCode.BAD_REQUEST)
          .json({ success: false, error: { message: "Invalid code" } });
      }
    } catch (err: any) {
      logger.error("Failed to verify TOTP", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }

  static async disable(req: TotpDisableRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.body;
      await TotpService.disable(userId);

      logger.info(`TOTP disabled for user: ${userId}`);
      res
        .status(ResponseCode.OK)
        .json({ success: true, data: { disabled: true } });
    } catch (err: any) {
      logger.error("Failed to disable TOTP", err);
      res
        .status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: { message: err.message } });
    }
  }
}
