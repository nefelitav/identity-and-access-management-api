import { PrismaClient } from "@prisma/client";
import { RbacRepository } from "~/repositories/rbac";

const prisma = new PrismaClient();
const rbacRepository = new RbacRepository(prisma);

export class RbacService {
  static async assignRoleToUser(userId: string, role: string) {
    return rbacRepository.assignRoleToUser(userId, role);
  }

  static async removeRoleFromUser(userId: string, role: string) {
    return rbacRepository.removeRoleFromUser(userId, role);
  }

  static async getUserRoles(userId: string) {
    const userRoles = await rbacRepository.getUserRoles(userId);
    return userRoles.map((ur: any) => ur.role.name);
  }

  static async getAllRoles() {
    return rbacRepository.getAllRoles();
  }

  static async createRole(name: string) {
    return rbacRepository.createRole(name);
  }

  static async deleteRole(name: string) {
    return rbacRepository.deleteRole(name);
  }
}
