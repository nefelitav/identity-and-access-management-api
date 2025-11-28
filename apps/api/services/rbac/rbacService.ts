import { RbacRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

export class RbacService {
  private static get rbacRepo() {
    return container.get<RbacRepository>(SERVICE_IDENTIFIERS.RbacRepository);
  }

  static async assignRoleToUser(userId: string, role: string) {
    return this.rbacRepo.assignRoleToUser(userId, role);
  }

  static async removeRoleFromUser(userId: string, role: string) {
    return this.rbacRepo.removeRoleFromUser(userId, role);
  }

  static async getUserRoles(userId: string) {
    const userRoles = await this.rbacRepo.getUserRoles(userId);
    return userRoles.map((ur: any) => ur.role.name);
  }

  static async getAllRoles() {
    return this.rbacRepo.getAllRoles();
  }

  static async createRole(name: string) {
    return this.rbacRepo.createRole(name);
  }

  static async deleteRole(name: string) {
    return this.rbacRepo.deleteRole(name);
  }
}
