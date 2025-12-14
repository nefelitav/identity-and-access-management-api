import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository, FilterOptions } from "~/repositories";

interface UserCreateInput {
  email: string;
  password: string;
}

interface UserUpdateInput {
  email?: string;
  password?: string;
  failedLoginAttempts?: number;
  lockoutUntil?: Date | null;
}

interface UserFilters extends FilterOptions {
  email?: string;
  role?: string;
  locked?: boolean;
}

export class UserRepository extends BaseRepository<
  Prisma.UserGetPayload<{}>,
  UserCreateInput,
  UserUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "user");
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        sessions: {
          select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
            lastActiveAt: true,
            expiresAt: true,
          },
        },
      },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async updateFailedAttempts(
    id: string,
    attempts: number,
    lockoutUntil?: Date | null,
  ) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: attempts,
        lockoutUntil,
      },
    });
  }

  async resetFailedAttempts(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });
  }

  protected buildWhereClause(filters: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.email = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    if (filters.email) {
      where.email = filters.email;
    }

    if (filters.role) {
      where.userRoles = {
        some: {
          role: {
            name: filters.role,
          },
        },
      };
    }

    if (filters.locked !== undefined) {
      if (filters.locked) {
        where.lockoutUntil = {
          gt: new Date(),
        };
      } else {
        where.OR = [
          { lockoutUntil: null },
          { lockoutUntil: { lt: new Date() } },
        ];
      }
    }

    return where;
  }

  protected buildOrderByClause(
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc",
  ): Prisma.UserOrderByWithRelationInput {
    const orderBy: Prisma.UserOrderByWithRelationInput = {};

    switch (sortBy) {
      case "email":
        orderBy.email = sortOrder;
        break;
      case "createdAt":
        orderBy.createdAt = sortOrder;
        break;
      case "updatedAt":
        orderBy.updatedAt = sortOrder;
        break;
      default:
        orderBy.createdAt = "desc";
    }

    return orderBy;
  }
}
