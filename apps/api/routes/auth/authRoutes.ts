import express from "express";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
} from "~/controllers/auth/authController";
import { validateRequest } from "~/middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
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

authRouter.post(
  "/logout",
  validateRequest(logoutSchema),
  logoutLimiter,
  logoutHandler,
);

export { authRouter };
