jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { createTotpRepository } from "~/repositories/mfa/totpRepository";

function createMockPrisma() {
  return {
    mfaSecret: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb({})),
  } as any;
}

describe("createTotpRepository", () => {
  it("getSecretByUserId should query by userId", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.findUnique.mockResolvedValue({
      userId: "u1",
      secret: "SEC",
      enabled: true,
    });

    const result = await repo.getSecretByUserId("u1");

    expect(prisma.mfaSecret.findUnique).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
    expect(result!.secret).toBe("SEC");
  });

  it("getSecretByUserId should return null when not found", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.findUnique.mockResolvedValue(null);

    const result = await repo.getSecretByUserId("missing");
    expect(result).toBeNull();
  });

  it("createOrUpdateSecret should upsert the secret", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.upsert.mockResolvedValue({
      userId: "u1",
      secret: "NEW",
      enabled: false,
    });

    const result = await repo.createOrUpdateSecret("u1", "NEW", false);

    expect(prisma.mfaSecret.upsert).toHaveBeenCalledWith({
      where: { userId: "u1" },
      update: { secret: "NEW", enabled: false },
      create: { userId: "u1", secret: "NEW", enabled: false },
    });
    expect(result.secret).toBe("NEW");
  });

  it("enableMfa should set enabled to true", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.update.mockResolvedValue({ userId: "u1", enabled: true });

    const result = await repo.enableMfa("u1");

    expect(prisma.mfaSecret.update).toHaveBeenCalledWith({
      where: { userId: "u1" },
      data: { enabled: true },
    });
    expect(result.enabled).toBe(true);
  });

  it("disableMfa should set enabled to false", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.update.mockResolvedValue({ userId: "u1", enabled: false });

    const result = await repo.disableMfa("u1");

    expect(prisma.mfaSecret.update).toHaveBeenCalledWith({
      where: { userId: "u1" },
      data: { enabled: false },
    });
    expect(result.enabled).toBe(false);
  });

  it("inherited findById should work via base repository", async () => {
    const prisma = createMockPrisma();
    const repo = createTotpRepository(prisma);

    prisma.mfaSecret.findUnique.mockResolvedValue({ id: "m1", userId: "u1" });

    const result = await repo.findById("m1");

    expect(prisma.mfaSecret.findUnique).toHaveBeenCalledWith({
      where: { id: "m1" },
    });
    expect(result!.id).toBe("m1");
  });
});
