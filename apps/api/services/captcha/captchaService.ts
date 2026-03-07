import { createLogger } from "~/utils";
import { config } from "~/config";
import { CaptchaVerificationFailedException } from "~/exceptions";

const logger = createLogger("CaptchaService");

export interface CaptchaVerificationResult {
  success: boolean;
  score?: number;
  errorCodes?: string[];
}

/** Verify a reCAPTCHA token with Google's API. */
export async function verifyCaptcha(
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

    logger.info("Captcha verification result", {
      success: data.success,
      score: data.score,
      errorCodes: data["error-codes"],
    });

    return {
      success: data.success,
      score: data.score,
      errorCodes: data["error-codes"],
    };
  } catch (error) {
    logger.error("Captcha verification failed:", error as Error);
    throw CaptchaVerificationFailedException();
  }
}
