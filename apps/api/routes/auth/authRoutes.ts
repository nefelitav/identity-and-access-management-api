import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  verifyMfaLoginHandler,
  verifyEmailHandler,
  resendVerificationHandler,
} from "~/controllers/auth/authController";
import { validateRequest, authMiddleware, requireCaptcha } from "~/middleware";
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
  emailVerifyLimiter,
} from "~/utils";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateRequest(registerSchema),
  registerLimiter,
  requireCaptcha(),
  registerHandler,
);

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  loginLimiter,
  requireCaptcha(),
  loginHandler,
);

authRouter.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshLimiter,
  refreshTokenHandler,
);

authRouter.post("/logout", logoutLimiter, authMiddleware, logoutHandler);

authRouter.post("/mfa-verify", loginLimiter, verifyMfaLoginHandler);

authRouter.post("/verify-email", emailVerifyLimiter, verifyEmailHandler);

authRouter.post(
  "/resend-verification",
  registerLimiter,
  authMiddleware,
  resendVerificationHandler,
);

export { authRouter };
