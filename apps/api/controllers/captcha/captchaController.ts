import { handleRequest } from "~/controllers/base/baseController";
import { verifyCaptcha } from "~/services/captcha/captchaService";
import { createLogger } from "~/utils";

const logger = createLogger("CaptchaController");

export const verifyHandler = handleRequest(async (req) => {
  const { token } = req.body;
  const result = await verifyCaptcha(token, req.ip);

  logger.info("Captcha verified successfully.");
  return {
    success: result.success,
    score: result.score,
  };
});
