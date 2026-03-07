jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { createRbacRepository } from "~/repositories/rbac/rbacRepository";

function createMockPrisma() {
  return {
    role: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
    rolePermission: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb({})),
  } as any;
}

describe("createRbacRepository", () => {
  it("assignRoleToUser should create role if it does not exist", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue(null);
    prisma.role.create.mockResolvedValue({ id: "r1", name: "admin" });
    prisma.userRole.create.mockResolvedValue({ userId: "u1", roleId: "r1" });

    await repo.assignRoleToUser("u1", "admin");

    expect(prisma.role.create).toHaveBeenCalledWith({
      data: { name: "admin" },
    });
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: { userId: "u1", roleId: "r1" },
    });
  });

  it("assignRoleToUser should use existing role", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue({ id: "r1", name: "admin" });
    prisma.userRole.create.mockResolvedValue({ userId: "u1", roleId: "r1" });

    await repo.assignRoleToUser("u1", "admin");

    expect(prisma.role.create).not.toHaveBeenCalled();
    expect(prisma.userRole.create).toHaveBeenCalledWith({
      data: { userId: "u1", roleId: "r1" },
    });
  });

  it("removeRoleFromUser should return null if role does not exist", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue(null);

    const result = await repo.removeRoleFromUser("u1", "nonexistent");

    expect(result).toBeNull();
    expect(prisma.userRole.delete).not.toHaveBeenCalled();
  });

  it("removeRoleFromUser should delete the userRole record", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue({ id: "r1", name: "admin" });
    prisma.userRole.delete.mockResolvedValue({ userId: "u1", roleId: "r1" });

    await repo.removeRoleFromUser("u1", "admin");

    expect(prisma.userRole.delete).toHaveBeenCalledWith({
      where: { userId_roleId: { userId: "u1", roleId: "r1" } },
    });
  });

  it("getUserRoles should return userRoles with included role", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.userRole.findMany.mockResolvedValue([{ role: { name: "admin" } }]);

    const result = await repo.getUserRoles("u1");

    expect(prisma.userRole.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      include: { role: true },
    });
    expect(result).toHaveLength(1);
  });

  it("deleteRole should cascade-delete userRoles and rolePermissions", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue({ id: "r1", name: "editor" });
    prisma.userRole.deleteMany.mockResolvedValue({ count: 2 });
    prisma.rolePermission.deleteMany.mockResolvedValue({ count: 1 });
    prisma.role.delete.mockResolvedValue({ id: "r1" });

    await repo.deleteRole("editor");

    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: { roleId: "r1" },
    });
    expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
      where: { roleId: "r1" },
    });
    expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
  });

  it("deleteRole should return null when role not found", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.findUnique.mockResolvedValue(null);

    const result = await repo.deleteRole("missing");

    expect(result).toBeNull();
  });

  it("createRole should create a new role", async () => {
    const prisma = createMockPrisma();
    const repo = createRbacRepository(prisma);

    prisma.role.create.mockResolvedValue({ id: "r1", name: "viewer" });

    const result = await repo.createRole("viewer");

    expect(prisma.role.create).toHaveBeenCalledWith({
      data: { name: "viewer" },
    });
    expect(result.name).toBe("viewer");
  });
});
