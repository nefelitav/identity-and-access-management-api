import { Request } from "express";

export interface TotpEnableRequestBody {
  userId: string;
}

export interface TotpConfirmRequestBody {
  userId: string;
  token: string;
}

export interface TotpVerifyRequestBody {
  userId: string;
  token: string;
}

export interface TotpDisableRequestBody {
  userId: string;
}

export type TotpEnableRequest = Request<{}, {}, TotpEnableRequestBody>;
export type TotpConfirmRequest = Request<{}, {}, TotpConfirmRequestBody>;
export type TotpVerifyRequest = Request<{}, {}, TotpVerifyRequestBody>;
export type TotpDisableRequest = Request<{}, {}, TotpDisableRequestBody>;

export interface OtpInEmailRequestBody {
  userId: string;
  email: string;
}

export interface OtpInSmsRequestBody {
  userId: string;
  phone: string;
}

export interface OtpVerifyRequestBody {
  userId: string;
  code: string;
}

export type OtpInEmailRequest = Request<{}, {}, OtpInEmailRequestBody>;
export type OtpInSmsRequest = Request<{}, {}, OtpInSmsRequestBody>;
export type OtpVerifyRequest = Request<{}, {}, OtpVerifyRequestBody>;
