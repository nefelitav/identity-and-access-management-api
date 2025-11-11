import { PrismaClient } from "@prisma/client";

export class PermissionsRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async grantPermissionToRole(roleId: string, permissionName: string) {
    let permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) {
      permission = await this.prisma.permission.create({
        data: { name: permissionName },
      });
    }

    await this.prisma.rolePermission.upsert({
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

  async revokePermissionFromRole(roleId: string, permissionName: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) return;

    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: permission.id,
      },
    });
  }

  async hasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const permission = await this.prisma.permission.findUnique({
      where: { name: permissionName },
    });

    if (!permission) return false;

    const roleBased = await this.prisma.userRole.findFirst({
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

  async getAllPermissions() {
    return this.prisma.permission.findMany();
  }

  async getUserPermissions(userId: string) {
    return this.prisma.role.findMany({
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

  async createPermission(name: string) {
    return this.prisma.permission.create({
      data: { name },
    });
  }

  async deletePermission(name: string) {
    return this.prisma.permission.delete({
      where: { name },
    });
  }
}
