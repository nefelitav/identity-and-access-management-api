import { prisma } from "@repo/prisma";

export class RbacRepository {
  static async assignRoleToUser(userId: string, role: string) {
    let existingRole = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!existingRole) {
      existingRole = await prisma.role.create({
        data: { name: role },
      });
    }

    return prisma.userRole.create({
      data: {
        userId,
        roleId: existingRole.id,
      },
    });
  }

  static async removeRoleFromUser(userId: string, role: string) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!existingRole) return;

    return prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: existingRole.id,
        },
      },
    });
  }

  static async getUserRoles(userId: string) {
    return prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  static async getAllRoles() {
    return prisma.role.findMany();
  }

  static async createRole(name: string) {
    return prisma.role.create({
      data: { name },
    });
  }

  static async deleteRole(name: string) {
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (!existingRole) return;

    await prisma.userRole.deleteMany({
      where: { roleId: existingRole.id },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: existingRole.id },
    });

    return prisma.role.delete({
      where: { id: existingRole.id },
    });
  }
}
