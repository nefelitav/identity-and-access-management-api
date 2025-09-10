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
import { createLogger, ResponseCode } from "~/utils";

const logger = createLogger("ProfileController");

export class ProfileController {
  static async updateProfile(
    req: Request,
    res: Response<UpdateProfileResponse>,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const userId = req.user?.id;
      const userAgent = req.headers["user-agent"];
      const ip = req.ip;

      const updatedUser = await ProfileService.updateProfile({
        userId,
        email,
        password,
        userAgent,
        ip,
      });

      logger.info(`User profile updated successfully: ${email}`);

      res.status(ResponseCode.OK).json({ success: true, data: updatedUser });
    } catch (err: any) {
      logger.error("Failed to update user profile", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async deleteUser(
    req: Request<{ id: string }>,
    res: Response<DeleteUserResponse>,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      await ProfileService.deleteUser(userId);

      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      logger.error("Deletion of user failed", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async requestPasswordReset(
    req: RequestPasswordResetRequest,
    res: Response<RequestPasswordResetResponse>,
  ) {
    try {
      const { email } = req.body;
      await ProfileService.requestPasswordReset(email);

      logger.info(`Password reset request was sent successfully: ${email}`);

      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      logger.error("Password reset request failed", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async resetPassword(
    req: ResetPasswordRequest,
    res: Response<ResetPasswordResponse>,
  ) {
    try {
      const { resetToken, newPassword } = req.body;
      await ProfileService.resetPassword(resetToken, newPassword);

      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      logger.error("Password reset failed", err);

      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async getUser(
    req: Request<{ id: string }>,
    res: Response<GetAccountResponse>,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = await ProfileService.getUser(userId);

      res.status(ResponseCode.OK).json({ success: true, data: user });
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }
}
