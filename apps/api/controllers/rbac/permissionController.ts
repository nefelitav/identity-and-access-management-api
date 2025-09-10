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
} from "~/dtos/rbac";
import { ResponseCode } from "~/utils";

export class PermissionController {
  static async check(req: Request, res: Response<CheckPermissionResponse>) {
    try {
      const { userId, permission } = req.query;
      const allowed = await PermissionService.checkPermission(
        userId as string,
        permission as string,
      );
      res.status(ResponseCode.OK).json({ success: true, data: { allowed } });
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async grant(
    req: GrantPermissionRequest,
    res: Response<GrantPermissionResponse>,
  ) {
    try {
      const { userId, permission } = req.body;
      await PermissionService.grantPermission(userId, permission);
      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async revoke(
    req: RevokePermissionRequest,
    res: Response<RevokePermissionResponse>,
  ) {
    try {
      const { userId, permission } = req.body;
      await PermissionService.revokePermissionFromRole(userId, permission);
      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async getAllPermissions(res: Response<GetAllPermissionsResponse>) {
    try {
      const permissions = await PermissionService.getAllPermissions();
      res.json({ success: true, data: { permissions } });
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async getUserPermissions(
    req: Request,
    res: Response<GetUserPermissionsResponse>,
  ) {
    try {
      const { userId } = req.params;
      const userPermissions =
        await PermissionService.getUserPermissions(userId);
      const permissions = userPermissions.flatMap((role) =>
        role.rolePermissions.map((rp) => rp.permission),
      );
      res.json({ success: true, data: { permissions } });
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async addPermission(
    req: AddPermissionRequest,
    res: Response<AddPermissionResponse>,
  ) {
    try {
      const { name } = req.body;
      await PermissionService.addPermission(name);
      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }

  static async deletePermission(
    req: DeletePermissionRequest,
    res: Response<DeletePermissionResponse>,
  ) {
    try {
      const { name } = req.body;
      await PermissionService.deletePermission(name);
      res.sendStatus(ResponseCode.OK);
    } catch (err: any) {
      res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: err.message },
      });
    }
  }
}
