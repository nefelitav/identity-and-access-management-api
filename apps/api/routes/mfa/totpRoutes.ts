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

totpRouter.post("/enable", totpSetupLimiter, authMiddleware, enableHandler);
totpRouter.post(
  "/confirm",
  totpSetupLimiter,
  authMiddleware,
  confirmAndEnableHandler,
);
totpRouter.post("/verify", totpVerifyLimiter, authMiddleware, verifyHandler);
totpRouter.post("/disable", totpSetupLimiter, authMiddleware, disableHandler);

export { totpRouter };
