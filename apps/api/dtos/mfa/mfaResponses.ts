import { ApiResponse } from "~/dtos";

interface TotpEnableResponseData {
  secret: string;
  qrCode: string;
}

interface TotpConfirmResponseData {
  success: boolean;
  error?: string;
}

interface TotpVerifyResponseData {
  success: boolean;
}

interface TotpDisableResponseData {
  success: boolean;
}

export type TotpEnableResponse = ApiResponse<TotpEnableResponseData>;
export type TotpConfirmResponse = ApiResponse<TotpConfirmResponseData>;
export type TotpVerifyResponse = ApiResponse<TotpVerifyResponseData>;
export type TotpDisableResponse = ApiResponse<TotpDisableResponseData>;

interface OtpInEmailResponseData {
  message: string;
}

interface OtpInSmsResponseData {
  message: string;
}

interface OtpVerifyResponseData {
  success: boolean;
}

export type OtpInEmailResponse = ApiResponse<OtpInEmailResponseData>;
export type OtpInSmsResponse = ApiResponse<OtpInSmsResponseData>;
export type OtpVerifyResponse = ApiResponse<OtpVerifyResponseData>;
