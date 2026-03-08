import { PrismaClient } from "@prisma/client";

export interface PermissionsRepository {
  grantPermissionToRole(roleId: string, permissionName: string): Promise<void>;
  revokePermissionFromRole(
    roleId: string,
    permissionName: string,
  ): Promise<void>;
  hasPermission(userId: string, permissionName: string): Promise<boolean>;
  getAllPermissions(): Promise<any[]>;
  getUserPermissions(userId: string): Promise<any[]>;
  createPermission(name: string): Promise<any>;
  deletePermission(name: string): Promise<any>;
}

export function createPermissionsRepository(
  prisma: PrismaClient,
): PermissionsRepository {
  return {
    async grantPermissionToRole(roleId: string, permissionName: string) {
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
          roleId_permissionId: { roleId, permissionId: permission.id },
        },
        update: {},
        create: { roleId, permissionId: permission.id },
      });
    },

    async revokePermissionFromRole(roleId: string, permissionName: string) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });
      if (!permission) return;

      await prisma.rolePermission.deleteMany({
        where: { roleId, permissionId: permission.id },
      });
    },

    async hasPermission(
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
            rolePermissions: { some: { permissionId: permission.id } },
          },
        },
      });

      return !!roleBased;
    },

    async getAllPermissions() {
      return prisma.permission.findMany();
    },

    async getUserPermissions(userId: string) {
      return prisma.role.findMany({
        where: { userRoles: { some: { userId } } },
        include: {
          rolePermissions: { include: { permission: true } },
        },
      });
    },

    async createPermission(name: string) {
      return prisma.permission.create({ data: { name } });
    },

    async deletePermission(name: string) {
      return prisma.permission.delete({ where: { name } });
    },
  };
}
