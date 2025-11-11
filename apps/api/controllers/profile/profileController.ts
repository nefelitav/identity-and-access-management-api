import { Request, Response } from "express";
import { ProfileService } from "~/services";
import {
  DeleteUserResponse,
  UpdateProfileResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  GetAccountResponse,
} from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
import { BaseController } from "~/controllers";

const logger = createLogger("ProfileController");

export class ProfileController extends BaseController {
  static async updateProfile(
    req: Request,
    res: Response<UpdateProfileResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { email, password } = req.body;
        const userId = req.user?.userId;
        const userAgent = this.extractUserAgent(req);
        const ip = this.extractIpAddress(req);

        const updatedUser = await ProfileService.updateProfile({
          userId,
          email,
          password,
          userAgent,
          ip,
        });

        logger.info(`User profile updated successfully: ${email}`);
        return updatedUser;
      },
      ResponseCode.OK,
    );
  }

  static async deleteUser(
    req: Request<{ id: string }>,
    res: Response<DeleteUserResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId;
        await ProfileService.deleteUser(userId);

        logger.info(`Deleted user: ${userId}`);
        return { message: "User deleted" };
      },
      ResponseCode.OK,
    );
  }

  static async requestPasswordReset(
    req: RequestPasswordResetRequest,
    res: Response<RequestPasswordResetResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { email } = req.body;
        await ProfileService.requestPasswordReset(email);

        logger.info(`Password reset requested for: ${email}`);
        return { message: "Password reset request sent" };
      },
      ResponseCode.OK,
    );
  }

  static async resetPassword(
    req: ResetPasswordRequest,
    res: Response<ResetPasswordResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { resetToken, newPassword } = req.body;
        await ProfileService.resetPassword(resetToken, newPassword);

        logger.info(`Password reset completed using token: ${resetToken}`);
        return { message: "Password reset successfully" };
      },
      ResponseCode.OK,
    );
  }

  static async getUser(
    req: Request<{ id: string }>,
    res: Response<GetAccountResponse>,
  ): Promise<void> {
    await this.handleRequest(
      req,
      res,
      async () => {
        const userId = req.user?.userId;
        const user = await ProfileService.getUser(userId);

        logger.info(`Fetched user details for: ${userId}`);
        return user;
      },
      ResponseCode.OK,
    );
  }
}
