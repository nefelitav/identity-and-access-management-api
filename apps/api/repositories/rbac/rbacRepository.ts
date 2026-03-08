import { Prisma, PrismaClient } from "@prisma/client";
import {
  createBaseRepository,
  FilterOptions,
  BaseRepository,
} from "~/repositories/base/BaseRepository";

interface RoleCreateInput {
  name: string;
}

interface RoleUpdateInput {
  name?: string;
}

interface RbacFilters extends FilterOptions {
  name?: string;
}

export interface RbacRepository
  extends BaseRepository<
    Prisma.RoleGetPayload<{}>,
    RoleCreateInput,
    RoleUpdateInput
  > {
  assignRoleToUser(userId: string, roleName: string): Promise<any>;
  removeRoleFromUser(userId: string, roleName: string): Promise<any>;
  getUserRoles(userId: string): Promise<any[]>;
  getAllRoles(): ReturnType<
    BaseRepository<
      Prisma.RoleGetPayload<{}>,
      RoleCreateInput,
      RoleUpdateInput
    >["findMany"]
  >;
  deleteRole(name: string): Promise<any>;
  createRole(name: string): Promise<Prisma.RoleGetPayload<{}>>;
}

function buildWhereClause(filters: RbacFilters): Prisma.RoleWhereInput {
  const where: Prisma.RoleWhereInput = {};

  if (filters.name) {
    where.name = { contains: filters.name, mode: "insensitive" };
  }

  if (filters.search) {
    where.name = { contains: filters.search, mode: "insensitive" };
  }

  return where;
}

function buildOrderByClause(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "asc",
): Prisma.RoleOrderByWithRelationInput {
  switch (sortBy) {
    case "name":
      return { name: sortOrder };
    default:
      return { name: "asc" };
  }
}

export function createRbacRepository(prisma: PrismaClient): RbacRepository {
  const base = createBaseRepository<
    Prisma.RoleGetPayload<{}>,
    RoleCreateInput,
    RoleUpdateInput
  >(prisma, "role", buildWhereClause, buildOrderByClause);

  return {
    ...base,

    async assignRoleToUser(userId: string, roleName: string) {
      let existingRole = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!existingRole) {
        existingRole = await base.create({ name: roleName });
      }

      return prisma.userRole.create({
        data: { userId, roleId: existingRole.id },
      });
    },

    async removeRoleFromUser(userId: string, roleName: string) {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleName },
      });
      if (!existingRole) return null;

      return prisma.userRole.delete({
        where: { userId_roleId: { userId, roleId: existingRole.id } },
      });
    },

    async getUserRoles(userId: string) {
      return prisma.userRole.findMany({
        where: { userId },
        include: { role: true },
      });
    },

    async getAllRoles() {
      return base.findMany({ limit: 1000 });
    },

    async deleteRole(name: string) {
      const existingRole = await prisma.role.findUnique({
        where: { name },
      });
      if (!existingRole) return null;

      await prisma.userRole.deleteMany({ where: { roleId: existingRole.id } });
      await prisma.rolePermission.deleteMany({
        where: { roleId: existingRole.id },
      });

      return prisma.role.delete({ where: { id: existingRole.id } });
    },

    async createRole(name: string) {
      return prisma.role.create({ data: { name } });
    },
  };
}
