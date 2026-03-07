import Router from "express";
import {
  requestCodeInSmsHandler,
  requestCodeInEmailHandler,
  verifyCodeHandler,
} from "~/controllers/mfa/otpController";
import { otpRequestLimiter, otpVerifyLimiter } from "~/utils";

const otpRouter = Router();

otpRouter.post("/request-sms", otpRequestLimiter, requestCodeInSmsHandler);
otpRouter.post("/request-email", otpRequestLimiter, requestCodeInEmailHandler);
otpRouter.post("/verify", otpVerifyLimiter, verifyCodeHandler);

export { otpRouter };
