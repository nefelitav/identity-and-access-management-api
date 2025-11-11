import { BaseRepository, FilterOptions } from "~/repositories";
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

export class TotpRepository extends BaseRepository<
  Prisma.MfaSecretGetPayload<{}>,
  TotpCreateInput,
  TotpUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, "mfaSecret");
  }

  protected buildWhereClause(filters: TotpFilters): Prisma.MfaSecretWhereInput {
    const where: Prisma.MfaSecretWhereInput = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.enabled !== undefined) {
      where.enabled = filters.enabled;
    }

    if (filters.search) {
      where.secret = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    return where;
  }

  protected buildOrderByClause(
    sortBy?: string,
    sortOrder: "asc" | "desc" = "desc",
  ): Prisma.MfaSecretOrderByWithRelationInput {
    const orderBy: Prisma.MfaSecretOrderByWithRelationInput = {};

    switch (sortBy) {
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

  async getSecretByUserId(userId: string) {
    return this.prisma.mfaSecret.findUnique({
      where: { userId },
    });
  }

  async createOrUpdateSecret(userId: string, secret: string, enabled = false) {
    return this.prisma.mfaSecret.upsert({
      where: { userId },
      update: { secret, enabled },
      create: { userId, secret, enabled },
    });
  }

  async enableMfa(userId: string) {
    return this.prisma.mfaSecret.update({
      where: { userId },
      data: { enabled: true },
    });
  }

  async disableMfa(userId: string) {
    return this.prisma.mfaSecret.update({
      where: { userId },
      data: { enabled: false },
    });
  }
}
