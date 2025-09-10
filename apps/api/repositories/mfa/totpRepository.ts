import { prisma } from "@repo/prisma";

export class TotpRepository {
  static async getSecretByUserId(userId: string) {
    return prisma.mfaSecret.findUnique({
      where: { userId },
    });
  }

  static async createOrUpdateSecret(
    userId: string,
    secret: string,
    enabled = false,
  ) {
    return prisma.mfaSecret.upsert({
      where: { userId },
      update: {
        secret,
        enabled,
      },
      create: {
        userId,
        secret,
        enabled,
      },
    });
  }

  static async enableMfa(userId: string) {
    return prisma.mfaSecret.update({
      where: { userId },
      data: { enabled: true },
    });
  }

  static async disableMfa(userId: string) {
    return prisma.mfaSecret.update({
      where: { userId },
      data: { enabled: false },
    });
  }
}
