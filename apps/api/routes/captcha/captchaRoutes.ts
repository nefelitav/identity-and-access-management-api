import { Router } from "express";
import { CaptchaController } from "~/controllers";

const captchaRouter = Router();

captchaRouter.post("/verify", CaptchaController.verify);

export default captchaRouter;
