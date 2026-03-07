import { createPermissionsRepository } from "~/repositories/rbac/permissionsRepository";

function createMockPrisma() {
  return {
    permission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    rolePermission: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
    },
    role: {
      findMany: jest.fn(),
    },
  } as any;
}

describe("createPermissionsRepository", () => {
  describe("grantPermissionToRole", () => {
    it("should create the permission if it does not exist, then upsert", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue(null);
      prisma.permission.create.mockResolvedValue({
        id: "p1",
        name: "read:users",
      });
      prisma.rolePermission.upsert.mockResolvedValue({});

      await repo.grantPermissionToRole("r1", "read:users");

      expect(prisma.permission.create).toHaveBeenCalledWith({
        data: { name: "read:users" },
      });
      expect(prisma.rolePermission.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roleId_permissionId: { roleId: "r1", permissionId: "p1" } },
        }),
      );
    });

    it("should use existing permission without creating", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue({
        id: "p1",
        name: "read:users",
      });
      prisma.rolePermission.upsert.mockResolvedValue({});

      await repo.grantPermissionToRole("r1", "read:users");

      expect(prisma.permission.create).not.toHaveBeenCalled();
    });
  });

  describe("revokePermissionFromRole", () => {
    it("should do nothing if permission does not exist", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue(null);

      await repo.revokePermissionFromRole("r1", "missing");

      expect(prisma.rolePermission.deleteMany).not.toHaveBeenCalled();
    });

    it("should delete rolePermission when permission exists", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue({ id: "p1" });
      prisma.rolePermission.deleteMany.mockResolvedValue({ count: 1 });

      await repo.revokePermissionFromRole("r1", "read:users");

      expect(prisma.rolePermission.deleteMany).toHaveBeenCalledWith({
        where: { roleId: "r1", permissionId: "p1" },
      });
    });
  });

  describe("hasPermission", () => {
    it("should return false when permission does not exist", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue(null);

      const result = await repo.hasPermission("u1", "missing");
      expect(result).toBe(false);
    });

    it("should return true when user has the permission through a role", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue({ id: "p1" });
      prisma.userRole.findFirst.mockResolvedValue({
        userId: "u1",
        roleId: "r1",
      });

      const result = await repo.hasPermission("u1", "read:users");
      expect(result).toBe(true);
    });

    it("should return false when user does not have the permission", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findUnique.mockResolvedValue({ id: "p1" });
      prisma.userRole.findFirst.mockResolvedValue(null);

      const result = await repo.hasPermission("u1", "admin:all");
      expect(result).toBe(false);
    });
  });

  describe("getAllPermissions", () => {
    it("should return all permissions", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.findMany.mockResolvedValue([
        { id: "p1", name: "read" },
      ]);

      const result = await repo.getAllPermissions();
      expect(result).toHaveLength(1);
    });
  });

  describe("getUserPermissions", () => {
    it("should return roles with included permissions", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.role.findMany.mockResolvedValue([
        { rolePermissions: [{ permission: { name: "read" } }] },
      ]);

      const result = await repo.getUserPermissions("u1");

      expect(prisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userRoles: { some: { userId: "u1" } } },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("createPermission", () => {
    it("should create a new permission", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.create.mockResolvedValue({
        id: "p1",
        name: "new:perm",
      });

      const result = await repo.createPermission("new:perm");
      expect(result.name).toBe("new:perm");
    });
  });

  describe("deletePermission", () => {
    it("should delete a permission by name", async () => {
      const prisma = createMockPrisma();
      const repo = createPermissionsRepository(prisma);

      prisma.permission.delete.mockResolvedValue({ id: "p1" });

      await repo.deletePermission("old:perm");
      expect(prisma.permission.delete).toHaveBeenCalledWith({
        where: { name: "old:perm" },
      });
    });
  });
});
