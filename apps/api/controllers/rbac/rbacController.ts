import { Request, Response } from "express";
import { RbacService } from "~/services";
import {
  AssignRoleRequest,
  AssignRoleResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  DeleteRoleResponse,
  GetAllRolesResponse,
  GetRolesResponse,
  RemoveRoleRequest,
  RemoveRoleResponse,
} from "~/dtos";
import { ResponseCode, createLogger } from "~/utils";
import { BaseController } from "~/controllers";

const logger = createLogger("RbacController");

export class RbacController extends BaseController {
  static async assignRole(
    req: AssignRoleRequest,
    res: Response<AssignRoleResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, role } = req.body;
        await RbacService.assignRoleToUser(userId, role);

        logger.info(`Assigned role "${role}" to user: ${userId}`);
        return { message: "Role assigned" };
      },
      ResponseCode.OK,
    );
  }

  static async removeRole(
    req: RemoveRoleRequest,
    res: Response<RemoveRoleResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, role } = req.body;
        await RbacService.removeRoleFromUser(userId, role);

        logger.info(`Removed role "${role}" from user: ${userId}`);
        return { message: "Role removed" };
      },
      ResponseCode.OK,
    );
  }

  static async getRoles(
    req: Request<{ userId: string }>,
    res: Response<GetRolesResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId } = req.params;
        const roles = await RbacService.getUserRoles(userId);

        logger.info(
          `Fetched roles for user: ${userId}. Count: ${roles.length}`,
        );
        return { roles };
      },
      ResponseCode.OK,
    );
  }

  static async getAllRoles(req: Request, res: Response<GetAllRolesResponse>) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const roles = await RbacService.getAllRoles();

        logger.info(`Fetched all roles. Count: ${roles.data.length}`);
        return { roles };
      },
      ResponseCode.OK,
    );
  }

  static async createRole(
    req: CreateRoleRequest,
    res: Response<CreateRoleResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { name } = req.body;
        const role = await RbacService.createRole(name);

        logger.info(`Created new role: "${name}"`);
        return { role };
      },
      ResponseCode.OK,
    );
  }

  static async deleteRole(
    req: Request<{ name: string }>,
    res: Response<DeleteRoleResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { name } = req.params;
        await RbacService.deleteRole(name);

        logger.info(`Deleted role: "${name}"`);
        return { message: "Role deleted" };
      },
      ResponseCode.OK,
    );
  }
}
