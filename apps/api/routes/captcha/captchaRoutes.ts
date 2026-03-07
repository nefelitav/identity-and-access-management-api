import { Router } from "express";
import { verifyHandler } from "~/controllers/captcha/captchaController";
import { captchaLimiter } from "~/utils";

const captchaRouter = Router();

captchaRouter.post("/verify", captchaLimiter, verifyHandler);

export { captchaRouter };
