import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    static async findById(id: string) {
        return prisma.user.findUnique({ where: { id } });
    }

    static async existsByEmail(email: string): Promise<boolean> {
        const user = await prisma.user.findUnique({ where: { email } });
        return !!user;
    }

    static async create(data: { email: string; password: string }) {
        return prisma.user.create({ data });
    }

    static async update(id: string, data: { email?: string; password?: string }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    static async delete(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    }

    static async findAll() {
        return prisma.user.findMany();
    }

    static async deleteAll() {
        return prisma.user.deleteMany();
    }
}