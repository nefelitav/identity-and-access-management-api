import * as authService from "~/services/auth/authService";
import {
  handleRequest,
  extractUserAgent,
  extractIpAddress,
} from "~/controllers/base/baseController";
import { ResponseCode } from "~/utils";
import createLogger from "~/utils/createLogger";

const logger = createLogger("AuthController");

export const registerHandler = handleRequest(async (req) => {
  const { email, password } = req.body;
  const userAgent = extractUserAgent(req);
  const ip = extractIpAddress(req);

  const result = await authService.register({
    email,
    password,
    userAgent,
    ip,
  });
  logger.info(`User registered successfully: ${email}`);
  return result;
}, ResponseCode.CREATED);

export const loginHandler = handleRequest(async (req) => {
  const { email, password, remember } = req.body;
  const userAgent = extractUserAgent(req);
  const ip = extractIpAddress(req);

  const tokens = await authService.login({
    email,
    password,
    userAgent,
    ip,
    remember,
  });
  logger.info(`User logged in: ${email}`);
  return tokens;
});

export const logoutHandler = handleRequest(async (req) => {
  const sessionId = req.user?.sessionId;
  const userId = req.user?.userId;

  await authService.logout({ sessionId, userId });
  logger.info(`User logged out: ${userId}`);
  return null;
});

export const refreshTokenHandler = handleRequest(async (req) => {
  const { refreshToken } = req.body;
  return await authService.refreshToken(refreshToken);
});

/** Verify MFA code after login returned mfaRequired: true. */
export const verifyMfaLoginHandler = handleRequest(async (req) => {
  const { mfaToken, code } = req.body;
  const userAgent = extractUserAgent(req);
  const ip = extractIpAddress(req);

  const tokens = await authService.verifyMfaLogin({
    mfaToken,
    code,
    userAgent,
    ip,
  });
  logger.info("MFA login verified successfully");
  return tokens;
});
