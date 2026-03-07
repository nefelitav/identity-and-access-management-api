import { handleRequest } from "~/controllers/base/baseController";
import * as otpService from "~/services/mfa/otpService";
import { createLogger } from "~/utils";
import { InvalidOtpTokenException } from "~/exceptions";

const logger = createLogger("OtpController");

/** Send a one-time password to the user's email. */
export const requestCodeInEmailHandler = handleRequest(async (req) => {
  const { userId, email } = req.body;
  await otpService.generateAndSendCodeViaEmail(userId, email);

  logger.info(`OTP email code sent to ${email} for user: ${userId}`);
  return { message: "Verification code sent" };
});

/** Send a one-time password via SMS. */
export const requestCodeInSmsHandler = handleRequest(async (req) => {
  const { userId, phone } = req.body;
  await otpService.generateAndSendCodeViaSms(userId, phone);

  logger.info(`OTP SMS code sent to ${phone} for user: ${userId}`);
  return { message: "Verification code sent" };
});

/** Verify a submitted OTP code. */
export const verifyCodeHandler = handleRequest(async (req) => {
  const { userId, code } = req.body;
  const isValid = await otpService.verifyCode(userId, code);

  if (!isValid) {
    logger.warn(`OTP verification failed for user: ${userId}`);
    throw InvalidOtpTokenException();
  }

  logger.info(`OTP verification succeeded for user: ${userId}`);
  return { isValid };
});
