import {
  createBaseRepository,
  FilterOptions,
  BaseRepository,
} from "~/repositories/base/BaseRepository";
import { Prisma, PrismaClient } from "@prisma/client";

interface TotpCreateInput {
  userId: string;
  secret: string;
  enabled?: boolean;
}

interface TotpUpdateInput {
  secret?: string;
  enabled?: boolean;
}

interface TotpFilters extends FilterOptions {
  userId?: string;
  enabled?: boolean;
}

export interface TotpRepository
  extends BaseRepository<
    Prisma.MfaSecretGetPayload<{}>,
    TotpCreateInput,
    TotpUpdateInput
  > {
  getSecretByUserId(
    userId: string,
  ): Promise<Prisma.MfaSecretGetPayload<{}> | null>;
  createOrUpdateSecret(
    userId: string,
    secret: string,
    enabled?: boolean,
  ): Promise<Prisma.MfaSecretGetPayload<{}>>;
  enableMfa(userId: string): Promise<Prisma.MfaSecretGetPayload<{}>>;
  disableMfa(userId: string): Promise<Prisma.MfaSecretGetPayload<{}>>;
}

function buildWhereClause(filters: TotpFilters): Prisma.MfaSecretWhereInput {
  const where: Prisma.MfaSecretWhereInput = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.enabled !== undefined) {
    where.enabled = filters.enabled;
  }

  if (filters.search) {
    where.secret = { contains: filters.search, mode: "insensitive" };
  }

  return where;
}

function buildOrderByClause(
  sortBy?: string,
  sortOrder: "asc" | "desc" = "desc",
): Prisma.MfaSecretOrderByWithRelationInput {
  switch (sortBy) {
    case "createdAt":
      return { createdAt: sortOrder };
    case "updatedAt":
      return { updatedAt: sortOrder };
    default:
      return { createdAt: "desc" };
  }
}

/** Create a TotpRepository backed by the given PrismaClient. */
export function createTotpRepository(prisma: PrismaClient): TotpRepository {
  const base = createBaseRepository<
    Prisma.MfaSecretGetPayload<{}>,
    TotpCreateInput,
    TotpUpdateInput
  >(prisma, "mfaSecret", buildWhereClause, buildOrderByClause);

  return {
    ...base,

    async getSecretByUserId(userId: string) {
      return prisma.mfaSecret.findUnique({ where: { userId } });
    },

    async createOrUpdateSecret(
      userId: string,
      secret: string,
      enabled = false,
    ) {
      return prisma.mfaSecret.upsert({
        where: { userId },
        update: { secret, enabled },
        create: { userId, secret, enabled },
      });
    },

    async enableMfa(userId: string) {
      return prisma.mfaSecret.update({
        where: { userId },
        data: { enabled: true },
      });
    },

    async disableMfa(userId: string) {
      return prisma.mfaSecret.update({
        where: { userId },
        data: { enabled: false },
      });
    },
  };
}
