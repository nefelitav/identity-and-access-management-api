import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthService } from "~/services";
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  RegisterResponse,
} from "~/dtos";
import { ResponseCode, JWT_SECRET, createLogger } from "~/utils";

const logger = createLogger("AuthController");

export class AuthController {
  static async register(
    req: RegisterRequest,
    res: Response<RegisterResponse>,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;

      const result = await AuthService.register({
        email,
        password,
        userAgent,
        ip,
      });
      logger.info(`User registered successfully: ${email}`);
      res.status(ResponseCode.CREATED).json({ success: true, data: result });
    } catch (err: any) {
      logger.error("Registration failed", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async login(
    req: LoginRequest,
    res: Response<LoginResponse>,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;

      const tokens = await AuthService.login({
        email,
        password,
        userAgent,
        ip,
      });
      logger.info(`User logged in successfully: ${email}`);
      res.status(ResponseCode.OK).json({ success: true, data: tokens });
    } catch (err: any) {
      logger.error("Login failed", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async logout(
    req: LogoutRequest,
    res: Response<LogoutResponse>,
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET!) as JwtPayload;
        const { sessionId, userId } = payload;

        await AuthService.logout({ sessionId, userId });
      }

      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async refreshToken(
    req: RefreshTokenRequest,
    res: Response<RefreshTokenResponse>,
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      res.status(ResponseCode.OK).json({ success: true, data: tokens });
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }
}
