import { Response } from 'express';
import { RbacService } from '~/services';
import {
    AssignRoleRequest,
    AssignRoleResponse,
    CreateRoleRequest,
    CreateRoleResponse,
    DeleteRoleRequest,
    DeleteRoleResponse,
    GetAllRolesResponse,
    GetRolesRequest,
    GetRolesResponse,
    RemoveRoleRequest,
    RemoveRoleResponse,
} from '~/dtos/rbac';
import { ResponseCode } from '~/utils';

export class RbacController {
    static async assignRole(req: AssignRoleRequest, res: Response<AssignRoleResponse>) {
        try {
            const { userId, role } = req.body;
            await RbacService.assignRoleToUser(userId, role);
            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async removeRole(req: RemoveRoleRequest, res: Response<RemoveRoleResponse>) {
        try {
            const { userId, role } = req.body;
            await RbacService.removeRoleFromUser(userId, role);
            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async getRoles(req: GetRolesRequest, res: Response<GetRolesResponse>) {
        try {
            const { userId } = req.params;
            const roles = await RbacService.getUserRoles(userId);
            res.status(ResponseCode.OK).json({ success: true, data: { roles } });
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async getAllRoles(res: Response<GetAllRolesResponse>) {
        try {
            const roles = await RbacService.getAllRoles();
            res.status(ResponseCode.OK).json({ success: true, data: { roles } });
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async createRole(req: CreateRoleRequest, res: Response<CreateRoleResponse>) {
        try {
            const { name } = req.body;
            const role = await RbacService.createRole(name);
            res.status(ResponseCode.OK).json({ success: true, data: { role } });
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async deleteRole(req: DeleteRoleRequest, res: Response<DeleteRoleResponse>) {
        try {
            const { name } = req.params;
            await RbacService.deleteRole(name);
            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }
}
