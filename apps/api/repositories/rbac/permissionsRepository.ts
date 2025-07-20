import { prisma } from "@repo/prisma";

export class PermissionsRepository {
  static async grantPermissionToRole(roleId: string, permissionName: string) {
    let permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      permission = await prisma.permission.create({
        data: { name: permissionName },
      });
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId,
        permissionId: permission.id,
      },
    });
  }

  static async revokePermissionFromRole(
    roleId: string,
    permissionName: string,
  ) {
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) return;

    await prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: permission.id,
      },
    });
  }

  static async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) return false;

    const roleBased = await prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          rolePermissions: {
            some: { permissionId: permission.id },
          },
        },
      },
    });

    return !!roleBased;
  }

  static async getAllPermissions() {
    return prisma.permission.findMany();
  }

  static async getUserPermissions(userId: string) {
    return prisma.role.findMany({
      where: {
        userRoles: { some: { userId } },
      },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    });
  }

  static async createPermission(name: string) {
    return prisma.permission.create({
      data: { name },
    });
  }

  static async deletePermission(name: string) {
    return prisma.permission.delete({
      where: { name },
    });
  }
}
