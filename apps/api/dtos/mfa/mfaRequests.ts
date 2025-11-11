import { Request } from "express";

interface TotpEnableRequestBody {
  userId: string;
}

interface TotpConfirmRequestBody {
  userId: string;
  token: string;
}

interface TotpVerifyRequestBody {
  userId: string;
  token: string;
}

interface TotpDisableRequestBody {
  userId: string;
}

export type TotpEnableRequest = Request<{}, {}, TotpEnableRequestBody>;
export type TotpConfirmRequest = Request<{}, {}, TotpConfirmRequestBody>;
export type TotpVerifyRequest = Request<{}, {}, TotpVerifyRequestBody>;
export type TotpDisableRequest = Request<{}, {}, TotpDisableRequestBody>;

interface OtpInEmailRequestBody {
  userId: string;
  email: string;
}

interface OtpInSmsRequestBody {
  userId: string;
  phone: string;
}

interface OtpVerifyRequestBody {
  userId: string;
  code: string;
}

export type OtpInEmailRequest = Request<{}, {}, OtpInEmailRequestBody>;
export type OtpInSmsRequest = Request<{}, {}, OtpInSmsRequestBody>;
export type OtpVerifyRequest = Request<{}, {}, OtpVerifyRequestBody>;
