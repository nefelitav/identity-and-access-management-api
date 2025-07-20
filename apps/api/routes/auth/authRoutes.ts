import express from "express";
import { AuthController } from "~/controllers";

const authRouter = express.Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh-token", AuthController.refreshToken);
authRouter.post("/logout", AuthController.logout);

export default authRouter;
