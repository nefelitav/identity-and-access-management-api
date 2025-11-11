import express from "express";
import { AuthController } from "~/controllers";
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

const authRoutes = express.Router();

authRoutes.post(
  "/register",
  validateRequest(registerSchema),
  registerLimiter,
  AuthController.register,
);

authRoutes.post(
  "/login",
  validateRequest(loginSchema),
  loginLimiter,
  AuthController.login,
);

authRoutes.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshLimiter,
  AuthController.refreshToken,
);

authRoutes.post(
  "/logout",
  validateRequest(logoutSchema),
  logoutLimiter,
  AuthController.logout,
);

export default authRoutes;
