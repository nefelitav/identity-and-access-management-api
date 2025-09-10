import { Router } from "express";
import { CaptchaController } from "~/controllers";
import { captchaLimiter } from "~/utils";

const captchaRouter = Router();

captchaRouter.post("/verify", captchaLimiter, CaptchaController.verify);

export default captchaRouter;
