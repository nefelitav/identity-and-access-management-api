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

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateRequest(registerSchema),
  registerLimiter,
  (req, res) => AuthController.register(req, res),
);

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  loginLimiter,
  (req, res) => AuthController.login(req, res),
);

authRouter.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  refreshLimiter,
  (req, res) => AuthController.refreshToken(req, res),
);

authRouter.post(
  "/logout",
  validateRequest(logoutSchema),
  logoutLimiter,
  (req, res) => AuthController.logout(req, res),
);

export { authRouter };
