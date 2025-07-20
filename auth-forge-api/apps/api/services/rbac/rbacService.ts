import { RbacRepository } from '~/repositories/rbac';

export class RbacService {
    static async assignRoleToUser(userId: string, role: string) {
        return RbacRepository.assignRoleToUser(userId, role);
    }

    static async removeRoleFromUser(userId: string, role: string) {
        return RbacRepository.removeRoleFromUser(userId, role);
    }

    static async getUserRoles(userId: string) {
        const userRoles = await RbacRepository.getUserRoles(userId);
        return userRoles.map((ur: any) => ur.role.name);
    }

    static async getAllRoles() {
        return RbacRepository.getAllRoles();
    }

    static async createRole(name: string) {
        return RbacRepository.createRole(name);
    }

    static async deleteRole(name: string) {
        return RbacRepository.deleteRole(name);
    }
}
