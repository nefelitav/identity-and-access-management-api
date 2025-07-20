import { Request } from "express";

export interface RegisterRequestBody {
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RefreshRequestBody {
  refreshToken: string;
}

export interface LogoutRequestBody {}

export type RegisterRequest = Request<{}, {}, RegisterRequestBody>;
export type LoginRequest = Request<{}, {}, LoginRequestBody>;
export type RefreshTokenRequest = Request<{}, {}, RefreshRequestBody>;
export type LogoutRequest = Request<{}, {}, LogoutRequestBody>;
