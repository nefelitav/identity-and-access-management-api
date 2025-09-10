import Router from "express";
import { OtpController } from "~/controllers";
import { otpRequestLimiter, otpVerifyLimiter } from "~/utils";

const otpRouter = Router();

otpRouter.post(
  "/request-sms",
  otpRequestLimiter,
  OtpController.requestCodeInSms,
);
otpRouter.post(
  "/request-email",
  otpRequestLimiter,
  OtpController.requestCodeInEmail,
);
otpRouter.post("/verify", otpVerifyLimiter, OtpController.verifyCode);

export default otpRouter;
