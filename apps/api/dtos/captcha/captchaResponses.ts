import { ApiResponse } from "~/dtos";

type CaptchaVerificationResponseData = {
  success: boolean;
  score?: number;
};

export type CaptchaVerificationResponse =
  ApiResponse<CaptchaVerificationResponseData>;
