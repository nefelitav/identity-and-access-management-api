import { Router } from "express";
import { TotpController } from "~/controllers";
import { totpSetupLimiter, totpVerifyLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const totpRouter = Router();

totpRouter.post(
  "/enable",
  authMiddleware,
  totpSetupLimiter,
  TotpController.enable,
);
totpRouter.post(
  "/confirm",
  authMiddleware,
  totpSetupLimiter,
  TotpController.confirmAndEnable,
);
totpRouter.post(
  "/verify",
  authMiddleware,
  totpVerifyLimiter,
  TotpController.verify,
);
totpRouter.post(
  "/disable",
  authMiddleware,
  totpSetupLimiter,
  TotpController.disable,
);

export default totpRouter;
