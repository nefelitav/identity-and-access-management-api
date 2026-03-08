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

authRouter.post("/logout", authMiddleware, logoutLimiter, logoutHandler);

authRouter.post("/mfa-verify", loginLimiter, verifyMfaLoginHandler);

authRouter.post("/verify-email", verifyEmailHandler);

authRouter.post(
  "/resend-verification",
  authMiddleware,
  registerLimiter,
  resendVerificationHandler,
);

export { authRouter };
