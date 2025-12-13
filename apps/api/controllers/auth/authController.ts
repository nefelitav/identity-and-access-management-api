import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthService } from "~/services";
import { BaseController } from "~/controllers";
import {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
} from "~/dtos";
import { createLogger, JWT_SECRET, ResponseCode } from "~/utils";

const logger = createLogger("AuthController");

export class AuthController extends BaseController {
  static async register(
    req: RegisterRequest,
    res: Response<RegisterResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { email, password } = req.body;
        const userAgent = this.extractUserAgent(req);
        const ip = this.extractIpAddress(req);

        const result = await AuthService.register({
          email,
          password,
          userAgent,
          ip,
        });

        logger.info(`User registered successfully: ${email}`);
        return result;
      },
      ResponseCode.CREATED,
    );
  }

  static async login(
    req: LoginRequest,
    res: Response<LoginResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { email, password, remember } = req.body;
      const userAgent = this.extractUserAgent(req);
      const ip = this.extractIpAddress(req);

      const tokens = await AuthService.login({
        email,
        password,
        userAgent,
        ip,
        remember,
      });

      logger.info(`User logged in successfully: ${email}`);
      return tokens;
    });
  }

  static async logout(
    req: LogoutRequest,
    res: Response<LogoutResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: { message: "Unauthorized: no token provided" },
        });
        return;
      }

      try {
        const token = authHeader.split(" ")[1];
        const payload = jwt.verify(token, JWT_SECRET!) as JwtPayload;
        const { sessionId, userId } = payload;

        await AuthService.logout({ sessionId, userId });
        res.status(200).json({ success: true, data: null });
      } catch (err) {
        res.status(401).json({
          success: false,
          error: { message: "Unauthorized: invalid token" },
        });
      }
    });
  }

  static async refreshToken(
    req: RefreshTokenRequest,
    res: Response<RefreshTokenResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { refreshToken } = req.body;
      return await AuthService.refreshToken(refreshToken);
    });
  }
}
