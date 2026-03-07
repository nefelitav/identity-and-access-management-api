jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { createUserRepository } from "~/repositories/auth/userRepository";

function createMockPrisma() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb({})),
  } as any;
}

describe("createUserRepository", () => {
  it("findByEmail should query with email and include relations", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    const user = { id: "u1", email: "a@b.com" };
    prisma.user.findUnique.mockResolvedValue(user);

    const result = await repo.findByEmail("a@b.com");

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "a@b.com" },
        include: expect.objectContaining({
          userRoles: expect.any(Object),
          sessions: expect.any(Object),
        }),
      }),
    );
    expect(result.email).toBe("a@b.com");
  });

  it("existsByEmail should return true when user exists", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    prisma.user.findUnique.mockResolvedValue({ id: "u1" });

    const result = await repo.existsByEmail("a@b.com");

    expect(result).toBe(true);
  });

  it("existsByEmail should return false when user does not exist", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await repo.existsByEmail("missing@test.com");

    expect(result).toBe(false);
  });

  it("updateFailedAttempts should update attempts and lockout", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    const lockout = new Date();
    prisma.user.update.mockResolvedValue({ id: "u1" });

    await repo.updateFailedAttempts("u1", 3, lockout);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { failedLoginAttempts: 3, lockoutUntil: lockout },
    });
  });

  it("resetFailedAttempts should reset attempts and lockout", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    prisma.user.update.mockResolvedValue({ id: "u1" });

    await repo.resetFailedAttempts("u1");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { failedLoginAttempts: 0, lockoutUntil: null },
    });
  });

  it("inherited create should call prisma.user.create", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    const data = { email: "new@test.com", password: "hashed" };
    prisma.user.create.mockResolvedValue({ id: "u1", ...data });

    const result = await repo.create(data);

    expect(prisma.user.create).toHaveBeenCalledWith({ data });
    expect(result.email).toBe("new@test.com");
  });

  it("inherited findById should call prisma.user.findUnique", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    prisma.user.findUnique.mockResolvedValue({ id: "u1" });

    const result = await repo.findById("u1");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
    });
    expect(result!.id).toBe("u1");
  });

  it("inherited delete should call prisma.user.delete", async () => {
    const prisma = createMockPrisma();
    const repo = createUserRepository(prisma);
    prisma.user.delete.mockResolvedValue({ id: "u1" });

    await repo.delete("u1");

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
});
