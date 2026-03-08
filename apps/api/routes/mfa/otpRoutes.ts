import Router from "express";
import {
  requestCodeInSmsHandler,
  requestCodeInEmailHandler,
  verifyCodeHandler,
} from "~/controllers/mfa/otpController";
import { otpRequestLimiter, otpVerifyLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const otpRouter = Router();

otpRouter.use(authMiddleware);

otpRouter.post("/request-sms", otpRequestLimiter, requestCodeInSmsHandler);
otpRouter.post("/request-email", otpRequestLimiter, requestCodeInEmailHandler);
otpRouter.post("/verify", otpVerifyLimiter, verifyCodeHandler);

export { otpRouter };
