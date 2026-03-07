import jwt, { JwtPayload } from "jsonwebtoken";
import * as authService from "~/services/auth/authService";
import {
  handleRequest,
  extractUserAgent,
  extractIpAddress,
} from "~/controllers/base/baseController";
import { ResponseCode, JWT_SECRET } from "~/utils";
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
  logger.info(`User logged in successfully: ${email}`);
  return tokens;
});

export const logoutHandler = handleRequest(async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const err = new Error("Unauthorized: no token provided") as Error & {
      statusCode: number;
    };
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(" ")[1];
  const payload = jwt.verify(token, JWT_SECRET!) as JwtPayload;
  const { sessionId, userId } = payload;

  await authService.logout({ sessionId, userId });
  return null;
});

export const refreshTokenHandler = handleRequest(async (req) => {
  const { refreshToken } = req.body;
  return await authService.refreshToken(refreshToken);
});
