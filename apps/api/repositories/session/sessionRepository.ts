import { PrismaClient } from "@prisma/client";

export interface SessionRepository {
  findById(id: string): Promise<any>;
  create(data: {
    id: string;
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<any>;
  delete(id: string): Promise<any>;
  findAll(userId: string): Promise<any[]>;
  findByToken(refreshToken: string): Promise<any>;
  deleteAll(userId: string): Promise<any>;
  updateLastActive(sessionId: string): Promise<any>;
}

export function createSessionRepository(
  prisma: PrismaClient,
): SessionRepository {
  return {
    async findById(id: string) {
      return prisma.session.findUnique({ where: { id } });
    },

    async create(data) {
      return prisma.session.create({ data });
    },

    async delete(id: string) {
      return prisma.session.delete({ where: { id } });
    },

    async findAll(userId: string) {
      return prisma.session.findMany({
        where: { userId },
        orderBy: { lastActiveAt: "desc" },
      });
    },

    async findByToken(refreshToken: string) {
      return prisma.session.findFirst({ where: { refreshToken } });
    },

    async deleteAll(userId: string) {
      return prisma.session.deleteMany({ where: { userId } });
    },

    async updateLastActive(sessionId: string) {
      return prisma.session.update({
        where: { id: sessionId },
        data: { lastActiveAt: new Date() },
      });
    },
  };
}
