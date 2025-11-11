import { Response } from "express";
import { TotpService } from "~/services";
import {
  TotpConfirmRequest,
  TotpDisableRequest,
  TotpEnableRequest,
  TotpVerifyRequest,
} from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
import { BaseController } from "~/controllers";
import { InvalidTotpTokenException } from "~/exceptions";

const logger = createLogger("TotpController");

export class TotpController extends BaseController {
  static async enable(req: TotpEnableRequest, res: Response): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId || req.body.userId;
        if (!userId) {
          throw new Error("User ID not found");
        }
        const { secret, qrCode } = await TotpService.generateSecret(userId);

        logger.info(`TOTP secret generated for user: ${userId}`);
        return { secret, qrCode };
      },
      ResponseCode.CREATED,
    );
  }

  static async confirmAndEnable(
    req: TotpConfirmRequest,
    res: Response,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId || req.body.userId;
        const { token } = req.body;
        if (!userId) {
          throw new Error("User ID not found");
        }
        const success = await TotpService.confirmAndEnable(userId, token);

        if (!success) {
          logger.warn(`Invalid TOTP token for user: ${userId}`);
          throw InvalidTotpTokenException();
        }

        logger.info(`TOTP confirmed and enabled for user: ${userId}`);
        return { success };
      },
      ResponseCode.OK,
    );
  }

  static async verify(req: TotpVerifyRequest, res: Response): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId || req.body.userId;
        const { token } = req.body;
        if (!userId) {
          throw new Error("User ID not found");
        }
        const isValid = await TotpService.verifyCode(userId, token);

        if (!isValid) {
          logger.warn(`TOTP verification failed for user: ${userId}`);
          throw InvalidTotpTokenException();
        }

        logger.info(`TOTP verification succeeded for user: ${userId}`);
        return { isValid };
      },
      ResponseCode.OK,
    );
  }

  static async disable(req: TotpDisableRequest, res: Response): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId || req.body.userId;
        if (!userId) {
          throw new Error("User ID not found");
        }
        await TotpService.disable(userId);

        logger.info(`TOTP disabled for user: ${userId}`);
        return { disabled: true };
      },
      ResponseCode.OK,
    );
  }
}
