import { PermissionsRepository } from '~/repositories/rbac';

export class PermissionService {
    static async checkPermission(userId: string, permission: string): Promise<boolean> {
        return PermissionsRepository.hasPermission(userId, permission);
    }

    static async grantPermission(userId: string, permission: string) {
        return PermissionsRepository.grantPermissionToRole(userId, permission);
    }

    static async revokePermissionFromRole(userId: string, permission: string) {
        return PermissionsRepository.revokePermissionFromRole(userId, permission);
    }

    static async getAllPermissions() {
        return PermissionsRepository.getAllPermissions();
    }

    static async getUserPermissions(userId: string) {
        return PermissionsRepository.getUserPermissions(userId);
    }

    static async addPermission(name: string) {
        return PermissionsRepository.createPermission(name);
    }

    static async deletePermission(name: string) {
        return PermissionsRepository.deletePermission(name);
    }
}
