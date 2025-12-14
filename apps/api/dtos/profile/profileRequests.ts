import { Request } from "express";

interface ResetPasswordBody {
  resetToken: string;
  newPassword: string;
}

interface RequestPasswordResetRequestBody {
  email: string;
}

export type RequestPasswordResetRequest = Request<
  {},
  {},
  RequestPasswordResetRequestBody
>;
export type ResetPasswordRequest = Request<{}, {}, ResetPasswordBody>;
