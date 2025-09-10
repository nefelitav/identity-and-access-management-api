import Router from "express";
import { OtpController } from "~/controllers";

const otpRouter = Router();

otpRouter.post("/request-sms", OtpController.requestCodeInSms);
otpRouter.post("/request-email", OtpController.requestCodeInEmail);
otpRouter.post("/verify", OtpController.verifyCode);

export default otpRouter;
