import { ApiResponse } from "~/dtos";

interface RegisterResponseData {
  id: string;
  email: string;
  createdAt: string;
  accessToken: string;
  refreshToken: string;
}

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseData {
  accessToken: string;
}

export type RegisterResponse = ApiResponse<RegisterResponseData>;
export type LoginResponse = ApiResponse<LoginResponseData>;
export type RefreshTokenResponse = ApiResponse<RefreshResponseData>;
export type LogoutResponse = ApiResponse<null>;
