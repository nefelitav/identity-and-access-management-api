jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    PermissionRepository: { serviceIdentifier: Symbol("PermissionRepository") },
  },
}));

jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { container } from "~/core";
import * as permissionService from "~/services/rbac/permissionService";

const mockRepo = {
  hasPermission: jest.fn(),
  grantPermissionToRole: jest.fn(),
  revokePermissionFromRole: jest.fn(),
  getAllPermissions: jest.fn(),
  getUserPermissions: jest.fn(),
  createPermission: jest.fn(),
  deletePermission: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockRepo);
});

describe("permissionService.checkPermission", () => {
  it("should return true when user has the permission", async () => {
    mockRepo.hasPermission.mockResolvedValue(true);

    const result = await permissionService.checkPermission("u1", "read:users");
    expect(result).toBe(true);
    expect(mockRepo.hasPermission).toHaveBeenCalledWith("u1", "read:users");
  });

  it("should return false when user lacks the permission", async () => {
    mockRepo.hasPermission.mockResolvedValue(false);

    const result = await permissionService.checkPermission("u1", "delete:all");
    expect(result).toBe(false);
  });
});

describe("permissionService.grantPermission", () => {
  it("should delegate to repo", async () => {
    mockRepo.grantPermissionToRole.mockResolvedValue(undefined);

    await permissionService.grantPermission("r1", "write:users");

    expect(mockRepo.grantPermissionToRole).toHaveBeenCalledWith(
      "r1",
      "write:users",
    );
  });
});

describe("permissionService.revokePermissionFromRole", () => {
  it("should delegate to repo", async () => {
    mockRepo.revokePermissionFromRole.mockResolvedValue(undefined);

    await permissionService.revokePermissionFromRole("r1", "write:users");

    expect(mockRepo.revokePermissionFromRole).toHaveBeenCalledWith(
      "r1",
      "write:users",
    );
  });
});

describe("permissionService.getAllPermissions", () => {
  it("should return all permissions", async () => {
    const perms = [{ id: "p1", name: "read:users" }];
    mockRepo.getAllPermissions.mockResolvedValue(perms);

    const result = await permissionService.getAllPermissions();
    expect(result).toEqual(perms);
  });
});

describe("permissionService.getUserPermissions", () => {
  it("should return user permissions from repo", async () => {
    const roles = [{ rolePermissions: [{ permission: { name: "read" } }] }];
    mockRepo.getUserPermissions.mockResolvedValue(roles);

    const result = await permissionService.getUserPermissions("u1");
    expect(result).toEqual(roles);
  });
});

describe("permissionService.addPermission", () => {
  it("should create a permission", async () => {
    mockRepo.createPermission.mockResolvedValue({ id: "p1", name: "new:perm" });

    const result = await permissionService.addPermission("new:perm");
    expect(mockRepo.createPermission).toHaveBeenCalledWith("new:perm");
    expect(result.name).toBe("new:perm");
  });
});

describe("permissionService.deletePermission", () => {
  it("should delete a permission", async () => {
    mockRepo.deletePermission.mockResolvedValue(undefined);

    await permissionService.deletePermission("old:perm");
    expect(mockRepo.deletePermission).toHaveBeenCalledWith("old:perm");
  });
});
