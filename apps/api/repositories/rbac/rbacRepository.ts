import { Prisma, PrismaClient } from "@prisma/client";
import { BaseRepository, FilterOptions } from "~/repositories";

interface RoleCreateInput {
  name: string;
}

interface RoleUpdateInput {
  name?: string;
}

interface RbacFilters extends FilterOptions {
  name?: string;
}

export class RbacRepository extends BaseRepository<
  Prisma.RoleGetPayload<{}>,
  RoleCreateInput,
  RoleUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "role");
  }

  protected buildWhereClause(filters: RbacFilters): Prisma.RoleWhereInput {
    const where: Prisma.RoleWhereInput = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    return where;
  }

  protected buildOrderByClause(
    sortBy?: string,
    sortOrder: "asc" | "desc" = "asc",
  ): Prisma.RoleOrderByWithRelationInput {
    const orderBy: Prisma.RoleOrderByWithRelationInput = {};

    switch (sortBy) {
      case "name":
        orderBy.name = sortOrder;
        break;
      default:
        orderBy.name = "asc";
    }

    return orderBy;
  }

  async assignRoleToUser(userId: string, roleName: string) {
    let existingRole = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) {
      existingRole = await this.create({ name: roleName });
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId: existingRole.id,
      },
    });
  }

  async removeRoleFromUser(userId: string, roleName: string) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) return null;

    return this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: existingRole.id,
        },
      },
    });
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });
  }

  async getAllRoles() {
    return this.findMany({ limit: 1000 }); // Arbitrary large limit
  }

  async deleteRole(name: string) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (!existingRole) return null;

    await this.prisma.userRole.deleteMany({
      where: { roleId: existingRole.id },
    });

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: existingRole.id },
    });

    return this.prisma.role.delete({
      where: { id: existingRole.id },
    });
  }

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name },
    });
  }
}
