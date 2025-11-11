import { container, SERVICE_IDENTIFIERS } from "~/core";
import { PermissionsRepository } from "~/repositories/rbac";

export class PermissionService {
  private static get permissionsRepo() {
    return container.get<PermissionsRepository>(
      SERVICE_IDENTIFIERS.PermissionRepository,
    );
  }

  static async checkPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    return this.permissionsRepo.hasPermission(userId, permission);
  }

  static async grantPermission(roleId: string, permission: string) {
    return this.permissionsRepo.grantPermissionToRole(roleId, permission);
  }

  static async revokePermissionFromRole(roleId: string, permission: string) {
    return this.permissionsRepo.revokePermissionFromRole(roleId, permission);
  }

  static async getAllPermissions() {
    return this.permissionsRepo.getAllPermissions();
  }

  static async getUserPermissions(userId: string) {
    return this.permissionsRepo.getUserPermissions(userId);
  }

  static async addPermission(name: string) {
    return this.permissionsRepo.createPermission(name);
  }

  static async deletePermission(name: string) {
    return this.permissionsRepo.deletePermission(name);
  }
}
