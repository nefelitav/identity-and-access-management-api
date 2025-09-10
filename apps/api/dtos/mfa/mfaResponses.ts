import { ApiResponse } from "~/dtos";

export interface TotpEnableResponseData {
  secret: string;
  qrCode: string;
}

export interface TotpConfirmResponseData {
  success: boolean;
  error?: string;
}

export interface TotpVerifyResponseData {
  success: boolean;
}

export interface TotpDisableResponseData {
  success: boolean;
}

export type TotpEnableResponse = ApiResponse<TotpEnableResponseData>;
export type TotpConfirmResponse = ApiResponse<TotpConfirmResponseData>;
export type TotpVerifyResponse = ApiResponse<TotpVerifyResponseData>;
export type TotpDisableResponse = ApiResponse<TotpDisableResponseData>;

export interface OtpInEmailResponseData {
  message: string;
}

export interface OtpInSmsResponseData {
  message: string;
}

export interface OtpVerifyResponseData {
  success: boolean;
}

export type OtpInEmailResponse = ApiResponse<OtpInEmailResponseData>;
export type OtpInSmsResponse = ApiResponse<OtpInSmsResponseData>;
export type OtpVerifyResponse = ApiResponse<OtpVerifyResponseData>;
