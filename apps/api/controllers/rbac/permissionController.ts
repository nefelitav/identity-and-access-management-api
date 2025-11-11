import { Request, Response } from "express";
import { PermissionService } from "~/services";
import {
  AddPermissionRequest,
  AddPermissionResponse,
  CheckPermissionResponse,
  DeletePermissionRequest,
  DeletePermissionResponse,
  GetAllPermissionsResponse,
  GetUserPermissionsResponse,
  GrantPermissionRequest,
  GrantPermissionResponse,
  RevokePermissionRequest,
  RevokePermissionResponse,
} from "~/dtos";
import { BaseController } from "~/controllers";
import { ResponseCode, createLogger } from "~/utils";

const logger = createLogger("PermissionController");

export class PermissionController extends BaseController {
  static async check(req: Request, res: Response<CheckPermissionResponse>) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, permission } = req.query;
        const allowed = await PermissionService.checkPermission(
          userId as string,
          permission as string,
        );

        logger.info(
          `Checked permission "${permission}" for user: ${userId}. Allowed: ${allowed}`,
        );
        return { allowed };
      },
      ResponseCode.OK,
    );
  }

  static async grant(
    req: GrantPermissionRequest,
    res: Response<GrantPermissionResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, permission } = req.body;
        await PermissionService.grantPermission(userId, permission);

        logger.info(`Granted permission "${permission}" to user: ${userId}`);
        return { message: "Permission granted" };
      },
      ResponseCode.OK,
    );
  }

  static async revoke(
    req: RevokePermissionRequest,
    res: Response<RevokePermissionResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId, permission } = req.body;
        await PermissionService.revokePermissionFromRole(userId, permission);

        logger.info(`Revoked permission "${permission}" from user: ${userId}`);
        return { message: "Permission revoked" };
      },
      ResponseCode.OK,
    );
  }

  static async getAllPermissions(res: Response<GetAllPermissionsResponse>) {
    await this.handleRequest(
      res.req!,
      res,
      async () => {
        const permissions = await PermissionService.getAllPermissions();

        logger.info(`Fetched all permissions. Count: ${permissions.length}`);
        return { permissions };
      },
      ResponseCode.OK,
    );
  }

  static async getUserPermissions(
    req: Request,
    res: Response<GetUserPermissionsResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { userId } = req.params;
        const userPermissions =
          await PermissionService.getUserPermissions(userId);
        const permissions = userPermissions.flatMap((role) =>
          role.rolePermissions.map((rp) => rp.permission),
        );

        logger.info(
          `Fetched permissions for user: ${userId}. Count: ${permissions.length}`,
        );
        return { permissions };
      },
      ResponseCode.OK,
    );
  }

  static async addPermission(
    req: AddPermissionRequest,
    res: Response<AddPermissionResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { name } = req.body;
        await PermissionService.addPermission(name);

        logger.info(`Added new permission: "${name}"`);
        return { message: "Permission added" };
      },
      ResponseCode.OK,
    );
  }

  static async deletePermission(
    req: DeletePermissionRequest,
    res: Response<DeletePermissionResponse>,
  ) {
    await this.handleRequest(
      req,
      res,
      async () => {
        const { name } = req.body;
        await PermissionService.deletePermission(name);

        logger.info(`Deleted permission: "${name}"`);
        return { message: "Permission deleted" };
      },
      ResponseCode.OK,
    );
  }
}
