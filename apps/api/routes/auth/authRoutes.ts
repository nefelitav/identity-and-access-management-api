import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  verifyMfaLoginHandler,
} from "~/controllers/auth/authController";
import { validateRequest, authMiddleware } from "~/middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "~/validation/schemas";
import {
  loginLimiter,
  logoutLimiter,
  refreshLimiter,
  registerLimiter,
} from "~/utils";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateRequest(registerSchema),
  registerLimiter,
  registerHandler,
);

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  loginLimiter,
  loginHandler,
);

authRouter.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshLimiter,
  refreshTokenHandler,
);

authRouter.post("/logout", authMiddleware, logoutLimiter, logoutHandler);

/** Complete login when MFA is required (no auth — uses short-lived mfaToken). */
authRouter.post("/mfa-verify", loginLimiter, verifyMfaLoginHandler);

export { authRouter };
