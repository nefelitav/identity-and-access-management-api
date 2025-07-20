import { Request } from "express";

interface CaptchaVerificationRequestBody {
  token: string;
}

export type CaptchaVerificationRequest =
  Request<CaptchaVerificationRequestBody>;
