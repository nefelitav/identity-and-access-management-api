import { prisma } from '@repo/prisma';

export class sessionRepository {
    static async findById(id: string) {
        return prisma.session.findUnique({
            where: { id },
        });
    }

    static async create(data: {
        id: string;
        userId: string;
        refreshToken: string;
        userAgent?: string;
        ipAddress?: string;
        expiresAt: Date;
    }) {
        return prisma.session.create({ data });
    }

    static async delete(id: string) {
        return prisma.session.delete({
            where: { id },
        });
    }

    static async findAll(userId: string) {
        return prisma.session.findMany({
            where: { userId },
            orderBy: { lastActiveAt: 'desc' },
        });
    }

    static async findByToken(refreshToken: string) {
        return prisma.session.findFirst({
            where: { refreshToken },
        });
    }

    static async deleteAll(userId: string) {
        return prisma.session.deleteMany({
            where: { userId },
        });
    }

    static async updateLastActive(sessionId: string) {
        return prisma.session.update({
            where: { id: sessionId },
            data: { lastActiveAt: new Date() },
        });
    }
}
