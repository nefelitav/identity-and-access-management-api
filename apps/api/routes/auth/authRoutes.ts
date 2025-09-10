import express from "express";
import { AuthController } from "~/controllers";
import {
  loginLimiter,
  logoutLimiter,
  refreshLimiter,
  registerLimiter,
} from "~/utils";

const authRouter = express.Router();

authRouter.post("/register", registerLimiter, AuthController.register);
authRouter.post("/login", loginLimiter, AuthController.login);
authRouter.post("/refresh-token", refreshLimiter, AuthController.refreshToken);
authRouter.post("/logout", logoutLimiter, AuthController.logout);

export default authRouter;
