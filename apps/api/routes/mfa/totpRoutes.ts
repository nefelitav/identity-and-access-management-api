import { Router } from "express";
import {
  enableHandler,
  confirmAndEnableHandler,
  verifyHandler,
  disableHandler,
} from "~/controllers/mfa/totpController";
import { totpSetupLimiter, totpVerifyLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const totpRouter = Router();

totpRouter.post("/enable", authMiddleware, totpSetupLimiter, enableHandler);
totpRouter.post(
  "/confirm",
  authMiddleware,
  totpSetupLimiter,
  confirmAndEnableHandler,
);
totpRouter.post("/verify", authMiddleware, totpVerifyLimiter, verifyHandler);
totpRouter.post("/disable", authMiddleware, totpSetupLimiter, disableHandler);

export { totpRouter };
