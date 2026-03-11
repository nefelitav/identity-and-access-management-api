import Router from "express";
import {
  requestCodeInSmsHandler,
  requestCodeInEmailHandler,
  verifyCodeHandler,
} from "~/controllers/mfa/otpController";
import { otpRequestLimiter, otpVerifyLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const otpRouter = Router();

otpRouter.post(
  "/request-sms",
  otpRequestLimiter,
  authMiddleware,
  requestCodeInSmsHandler,
);
otpRouter.post(
  "/request-email",
  otpRequestLimiter,
  authMiddleware,
  requestCodeInEmailHandler,
);
otpRouter.post("/verify", otpVerifyLimiter, authMiddleware, verifyCodeHandler);

export { otpRouter };
