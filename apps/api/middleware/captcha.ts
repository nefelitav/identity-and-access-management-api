import { Request, Response, NextFunction } from "express";
import { verifyCaptcha } from "~/services/captcha/captchaService";
import { config } from "~/config";
import { createLogger } from "~/utils";

const logger = createLogger("CaptchaMiddleware");

export function requireCaptcha() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!config.RECAPTCHA_SECRET_KEY) {
      return next();
    }

    const token = req.body.captchaToken || req.headers["x-captcha-token"];

    if (!token) {
      res.status(400).json({
        success: false,
        error: {
          code: "CAPTCHA_REQUIRED",
          message: "Captcha token is required",
        },
      });
      return;
    }

    try {
      const result = await verifyCaptcha(token as string, req.ip);

      if (!result.success) {
        logger.warn("Captcha verification failed", { ip: req.ip });
        res.status(403).json({
          success: false,
          error: {
            code: "CAPTCHA_FAILED",
            message: "Captcha verification failed",
          },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
