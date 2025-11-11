import { PrismaClient } from "@prisma/client";

export class SessionRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  async create(data: {
    id: string;
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    return this.prisma.session.create({ data });
  }

  async delete(id: string) {
    return this.prisma.session.delete({
      where: { id },
    });
  }

  async findAll(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastActiveAt: "desc" },
    });
  }

  async findByToken(refreshToken: string) {
    return this.prisma.session.findFirst({
      where: { refreshToken },
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  async updateLastActive(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });
  }
}
