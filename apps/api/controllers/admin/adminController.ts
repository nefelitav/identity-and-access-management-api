import { Request, Response } from "express";
import { AdminService, ProfileService } from "~/services";
import { BaseController } from "~/controllers";
import {
  DeleteUserResponse,
  UpdateProfileResponse,
  GetUsersResponse,
  DeleteUsersResponse,
  GetUserResponse,
} from "~/dtos";
import { createLogger } from "~/utils";

const logger = createLogger("AdminController");

export class AdminController extends BaseController {
  static async getUser(
    req: Request,
    res: Response<GetUserResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const userId = req.params.id;
      const user = await ProfileService.getUser(userId);

      logger.info(`Fetched user with ID: ${userId}`);
      return user;
    });
  }

  static async getUsers(
    req: Request,
    res: Response<GetUsersResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const {
        page = 1,
        limit = 10,
        search,
        role,
        sortBy,
        sortOrder,
      } = req.query;

      const users = await AdminService.getUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        role: role as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      logger.info(`Fetched ${users.data.length} users (page ${page})`);
      return users;
    });
  }

  static async deleteUsers(
    req: Request,
    res: Response<DeleteUsersResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      await AdminService.deleteUsers();
      logger.info("Deleted all users");
    });
  }

  static async deleteUser(
    req: Request,
    res: Response<DeleteUserResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const userId = req.params.id;
      await ProfileService.deleteUser(userId);
      logger.info(`Deleted user with ID: ${userId}`);
    });
  }

  static async updateProfile(
    req: Request,
    res: Response<UpdateProfileResponse>,
  ): Promise<void> {
    await this.handleRequest(req, res, async () => {
      const { email, password } = req.body;
      const userId = req.params.id;
      const userAgent = this.extractUserAgent(req);
      const ip = this.extractIpAddress(req);

      const updatedUser = await ProfileService.updateProfile({
        userId,
        email,
        password,
        userAgent,
        ip,
      });

      logger.info(`Admin updated profile for user with ID: ${userId}`);
      return updatedUser;
    });
  }
}
