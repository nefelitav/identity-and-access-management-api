import { handleRequest } from "~/controllers/base/baseController";
import * as totpService from "~/services/mfa/totpService";
import { ResponseCode, createLogger } from "~/utils";
import { InvalidTotpTokenException } from "~/exceptions";

const logger = createLogger("TotpController");

/** Begin TOTP setup by generating a secret and QR code. */
export const enableHandler = handleRequest(async (req) => {
  const userId = req.user?.userId || req.body.userId;
  if (!userId) throw new Error("User ID not found");

  const { secret, qrCode } = await totpService.generateSecret(userId);
  logger.info(`TOTP secret generated for user: ${userId}`);
  return { secret, qrCode };
}, ResponseCode.CREATED);

/** Confirm TOTP token and activate MFA for the user. */
export const confirmAndEnableHandler = handleRequest(async (req) => {
  const userId = req.user?.userId || req.body.userId;
  const { token } = req.body;
  if (!userId) throw new Error("User ID not found");

  const success = await totpService.confirmAndEnable(userId, token);
  if (!success) {
    logger.warn(`Invalid TOTP token for user: ${userId}`);
    throw InvalidTotpTokenException();
  }

  logger.info(`TOTP confirmed and enabled for user: ${userId}`);
  return { success };
});

/** Verify a TOTP token during login or sensitive operations. */
export const verifyHandler = handleRequest(async (req) => {
  const userId = req.user?.userId || req.body.userId;
  const { token } = req.body;
  if (!userId) throw new Error("User ID not found");

  const isValid = await totpService.verifyCode(userId, token);
  if (!isValid) {
    logger.warn(`TOTP verification failed for user: ${userId}`);
    throw InvalidTotpTokenException();
  }

  logger.info(`TOTP verification succeeded for user: ${userId}`);
  return { isValid };
});

/** Disable TOTP MFA for the user. */
export const disableHandler = handleRequest(async (req) => {
  const userId = req.user?.userId || req.body.userId;
  if (!userId) throw new Error("User ID not found");

  await totpService.disable(userId);
  logger.info(`TOTP disabled for user: ${userId}`);
  return { disabled: true };
});
