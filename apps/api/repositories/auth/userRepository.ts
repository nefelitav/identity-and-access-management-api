import { PrismaClient, Prisma } from "@prisma/client";
import {
  createBaseRepository,
  FilterOptions,
  type BaseRepository,
} from "~/repositories/base/BaseRepository";

export type UserRecord = Prisma.UserGetPayload<{}> & {
  emailVerified: boolean;
};

interface UserCreateInput {
  email: string;
  password: string;
}

interface UserUpdateInput {
  email?: string;
  password?: string;
  emailVerified?: boolean;
  failedLoginAttempts?: number;
  lockoutUntil?: Date | null;
}

interface UserFilters extends FilterOptions {
  email?: string;
  role?: string;
  locked?: boolean;
}

export interface UserRepository
  extends BaseRepository<UserRecord, UserCreateInput, UserUpdateInput> {
  findByEmail(email: string): Promise<any>;
  existsByEmail(email: string): Promise<boolean>;
  updateFailedAttempts(
    id: string,
    attempts: number,
    lockoutUntil?: Date | null,
  ): Promise<UserRecord>;
  resetFailedAttempts(id: string): Promise<UserRecord>;
}

function buildWhereClause(filters: UserFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (filters.search) {
    where.email = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.email) {
    where.email = filters.email;
  }

  if (filters.role) {
    where.userRoles = { some: { role: { name: filters.role } } };
  }

  if (filters.locked !== undefined) {
    if (filters.locked) {
      where.lockoutUntil = { gt: new Date() };
    } else {
      where.OR = [{ lockoutUntil: null }, { lockoutUntil: { lt: new Date() } }];
    }
  }

  return where;
}

function buildOrderByClause(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc",
): Prisma.UserOrderByWithRelationInput {
  switch (sortBy) {
    case "email":
      return { email: sortOrder };
    case "createdAt":
      return { createdAt: sortOrder };
    case "updatedAt":
      return { updatedAt: sortOrder };
    default:
      return { createdAt: "desc" };
  }
}

export function createUserRepository(prisma: PrismaClient): UserRepository {
  const base = createBaseRepository<
    Prisma.UserGetPayload<{}>,
    UserCreateInput,
    UserUpdateInput
  >(prisma, "user", buildWhereClause, buildOrderByClause);

  return {
    ...base,

    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
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
    },

    async existsByEmail(email: string): Promise<boolean> {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return !!user;
    },

    async updateFailedAttempts(
      id: string,
      attempts: number,
      lockoutUntil?: Date | null,
    ) {
      return prisma.user.update({
        where: { id },
        data: { failedLoginAttempts: attempts, lockoutUntil },
      });
    },

    async resetFailedAttempts(id: string) {
      return prisma.user.update({
        where: { id },
        data: { failedLoginAttempts: 0, lockoutUntil: null },
      });
    },
  };
}
