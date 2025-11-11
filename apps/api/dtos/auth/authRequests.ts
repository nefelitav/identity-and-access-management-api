import { Request } from "express";

interface RegisterRequestBody {
  email: string;
  password: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
  remember?: boolean;
}

interface RefreshRequestBody {
  refreshToken: string;
}

interface LogoutRequestBody {}

export type RegisterRequest = Request<{}, {}, RegisterRequestBody>;
export type LoginRequest = Request<{}, {}, LoginRequestBody>;
export type RefreshTokenRequest = Request<{}, {}, RefreshRequestBody>;
export type LogoutRequest = Request<{}, {}, LogoutRequestBody>;
