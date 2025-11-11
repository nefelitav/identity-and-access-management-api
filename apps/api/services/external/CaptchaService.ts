import { createLogger } from "~/utils";
import { config } from "~/config";
import { CaptchaVerificationFailedException } from "~/exceptions";

const logger = createLogger("CaptchaService");

export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  errorCodes?: string[];
}

export class CaptchaService {
  constructor(private logger?: any) {}

  async verifyCaptcha(
    token: string,
    remoteIp?: string,
  ): Promise<CaptchaVerificationResult> {
    try {
      const response = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            secret: config.RECAPTCHA_SECRET_KEY,
            response: token,
            remoteip: remoteIp || "",
          }),
        },
      );

      const data = (await response.json()) as {
        success: boolean;
        score?: number;
        "error-codes"?: string[];
      };

      if (this.logger) {
        this.logger.info("Captcha verification result", {
          success: data.success,
          score: data.score,
          errorCodes: data["error-codes"],
        });
      } else {
        logger.info("Captcha verification result", {
          success: data.success,
          score: data.score,
          errorCodes: data["error-codes"],
        });
      }

      return {
        success: data.success,
        score: data.score,
        errorCodes: data["error-codes"],
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error("Captcha verification failed:", error as Error);
      } else {
        logger.error("Captcha verification failed:", error as Error);
      }
      throw CaptchaVerificationFailedException();
    }
  }

  async verifyCaptchaV2(token: string, remoteIp?: string): Promise<boolean> {
    const result = await this.verifyCaptcha(token, remoteIp);
    return result.success;
  }

  async verifyCaptchaV3(
    token: string,
    remoteIp?: string,
    minScore: number = 0.5,
  ): Promise<boolean> {
    const result = await this.verifyCaptcha(token, remoteIp);
    return result.success && (result.score || 0) >= minScore;
  }

  // Static method for convenience
  static async verify(
    token: string,
    remoteIp?: string,
  ): Promise<{ success: boolean; score?: number }> {
    const instance = new CaptchaService();
    const result = await instance.verifyCaptcha(token, remoteIp);
    return { success: result.success, score: result.score };
  }
}
