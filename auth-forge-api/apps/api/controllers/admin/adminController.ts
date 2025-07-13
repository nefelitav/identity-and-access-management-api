import { Response } from 'express';
import { AdminService, ProfileService } from '~/services';
import {
    UpdateProfileAdminRequest,
    DeleteUserRequest,
    DeleteUserResponse,
    UpdateProfileResponse,
    GetUsersResponse,
    DeleteUsersResponse,
    GetUserResponse,
    GetUserRequest,
} from '~/dtos';
import { createLogger, ResponseCode } from '~/utils';

const logger = createLogger('AdminController');

export class AdminController {
    static async getUser(req: GetUserRequest, res: Response<GetUserResponse>): Promise<void> {
        try {
            const userId = req.params.id;
            const user = await ProfileService.getUser(userId);

            logger.info(`Fetched user with ID: ${userId} `);
            res.status(ResponseCode.OK).json({ success: true, data: user });
        } catch (err: any) {
            logger.error('Fetching user failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async getUsers(res: Response<GetUsersResponse>): Promise<void> {
        try {
            const users = await AdminService.getUsers();

            logger.info(`Fetched ${users.length} users`);
            res.status(ResponseCode.OK).json({ success: true, data: users });
        } catch (err: any) {
            logger.error('Fetching users failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async deleteUsers(res: Response<DeleteUsersResponse>): Promise<void> {
        try {
            await AdminService.deleteUsers();

            logger.info(`Deleted all users`);
            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            logger.error('Deleting users failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async deleteUser(
        req: DeleteUserRequest,
        res: Response<DeleteUserResponse>,
    ): Promise<void> {
        try {
            const userId = req.params.id;
            await ProfileService.deleteUser(userId);

            logger.info(`Deleted user with ID: ${userId}`);
            res.sendStatus(ResponseCode.OK);
        } catch (err: any) {
            logger.error('Deleting user failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }

    static async updateProfile(
        req: UpdateProfileAdminRequest,
        res: Response<UpdateProfileResponse>,
    ): Promise<void> {
        try {
            const { email, password } = req.body;
            const userId = req.params.id;
            const userAgent = req.headers['user-agent'];
            const ip = req.ip;

            const updatedUser = await ProfileService.updateProfile({
                userId,
                email,
                password,
                userAgent,
                ip,
            });

            logger.info(`Admin updated profile for user with ID: ${userId}`);

            res.status(ResponseCode.OK).json({ success: true, data: updatedUser });
        } catch (err: any) {
            logger.error('Admin profile update failed', err);

            res.status(err.statusCode ?? ResponseCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: err.message },
            });
        }
    }
}
