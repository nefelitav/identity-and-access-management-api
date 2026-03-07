jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { createSessionRepository } from "~/repositories/session/sessionRepository";

function createMockPrisma() {
  return {
    session: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
  } as any;
}

describe("createSessionRepository", () => {
  it("findById should query by id", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.findUnique.mockResolvedValue({ id: "s1" });

    const result = await repo.findById("s1");

    expect(prisma.session.findUnique).toHaveBeenCalledWith({
      where: { id: "s1" },
    });
    expect(result.id).toBe("s1");
  });

  it("create should persist session data", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    const data = {
      id: "s1",
      userId: "u1",
      refreshToken: "hashed",
      userAgent: "jest",
      ipAddress: "127.0.0.1",
      expiresAt: new Date(),
    };
    prisma.session.create.mockResolvedValue(data);

    const result = await repo.create(data);

    expect(prisma.session.create).toHaveBeenCalledWith({ data });
    expect(result.userId).toBe("u1");
  });

  it("delete should remove by id", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.delete.mockResolvedValue({ id: "s1" });

    await repo.delete("s1");

    expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: "s1" } });
  });

  it("findAll should return sessions ordered by lastActiveAt desc", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.findMany.mockResolvedValue([{ id: "s1" }, { id: "s2" }]);

    const result = await repo.findAll("u1");

    expect(prisma.session.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: { lastActiveAt: "desc" },
    });
    expect(result).toHaveLength(2);
  });

  it("findByToken should query by refreshToken", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.findFirst.mockResolvedValue({
      id: "s1",
      refreshToken: "hashed",
    });

    const result = await repo.findByToken("hashed");

    expect(prisma.session.findFirst).toHaveBeenCalledWith({
      where: { refreshToken: "hashed" },
    });
    expect(result.id).toBe("s1");
  });

  it("deleteAll should delete all sessions for a user", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.deleteMany.mockResolvedValue({ count: 3 });

    await repo.deleteAll("u1");

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
  });

  it("updateLastActive should set lastActiveAt to now", async () => {
    const prisma = createMockPrisma();
    const repo = createSessionRepository(prisma);
    prisma.session.update.mockResolvedValue({ id: "s1" });

    await repo.updateLastActive("s1");

    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { lastActiveAt: expect.any(Date) },
    });
  });
});
