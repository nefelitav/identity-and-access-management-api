jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/rbac/permissionService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as permissionService from "~/services/rbac/permissionService";
import {
  checkHandler,
  grantHandler,
  revokeHandler,
  getAllPermissionsHandler,
  getUserPermissionsHandler,
  addPermissionHandler,
  deletePermissionHandler,
} from "~/controllers/rbac/permissionController";

beforeEach(() => jest.clearAllMocks());

describe("checkHandler", () => {
  it("should check if a user has a permission", async () => {
    (permissionService.checkPermission as jest.Mock).mockResolvedValue(true);

    const req = createMockReq({
      query: { userId: "u1", permission: "read:users" } as any,
    });
    const res = createMockRes();
    const next = createMockNext();

    await checkHandler(req, res, next);

    expect(permissionService.checkPermission).toHaveBeenCalledWith(
      "u1",
      "read:users",
    );
    expect(res._json.data).toEqual({ allowed: true });
  });

  it("should return allowed: false when permission denied", async () => {
    (permissionService.checkPermission as jest.Mock).mockResolvedValue(false);

    const req = createMockReq({
      query: { userId: "u1", permission: "delete:users" } as any,
    });
    const res = createMockRes();
    const next = createMockNext();

    await checkHandler(req, res, next);

    expect(res._json.data).toEqual({ allowed: false });
  });
});

describe("grantHandler", () => {
  it("should grant a permission", async () => {
    (permissionService.grantPermission as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({
      body: { userId: "r1", permission: "write:users" },
    });
    const res = createMockRes();
    const next = createMockNext();

    await grantHandler(req, res, next);

    expect(permissionService.grantPermission).toHaveBeenCalledWith(
      "r1",
      "write:users",
    );
    expect(res._json.data.message).toBe("Permission granted");
  });
});

describe("revokeHandler", () => {
  it("should revoke a permission", async () => {
    (permissionService.revokePermissionFromRole as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({
      body: { userId: "r1", permission: "write:users" },
    });
    const res = createMockRes();
    const next = createMockNext();

    await revokeHandler(req, res, next);

    expect(permissionService.revokePermissionFromRole).toHaveBeenCalledWith(
      "r1",
      "write:users",
    );
    expect(res._json.data.message).toBe("Permission revoked");
  });
});

describe("getAllPermissionsHandler", () => {
  it("should return all permissions", async () => {
    const perms = [{ id: "p1", name: "read:users" }];
    (permissionService.getAllPermissions as jest.Mock).mockResolvedValue(perms);

    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    await getAllPermissionsHandler(req, res, next);

    expect(res._json.data).toEqual({ permissions: perms });
  });
});

describe("getUserPermissionsHandler", () => {
  it("should return flattened permissions for a user", async () => {
    const roles = [
      {
        rolePermissions: [
          { permission: { id: "p1", name: "read:users" } },
          { permission: { id: "p2", name: "write:users" } },
        ],
      },
    ];
    (permissionService.getUserPermissions as jest.Mock).mockResolvedValue(
      roles,
    );

    const req = createMockReq({ params: { userId: "u1" } });
    const res = createMockRes();
    const next = createMockNext();

    await getUserPermissionsHandler(req, res, next);

    expect(res._json.data.permissions).toHaveLength(2);
    expect(res._json.data.permissions[0].name).toBe("read:users");
  });
});

describe("addPermissionHandler", () => {
  it("should add a new permission", async () => {
    (permissionService.addPermission as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({ body: { name: "delete:posts" } });
    const res = createMockRes();
    const next = createMockNext();

    await addPermissionHandler(req, res, next);

    expect(permissionService.addPermission).toHaveBeenCalledWith(
      "delete:posts",
    );
    expect(res._json.data.message).toBe("Permission added");
  });
});

describe("deletePermissionHandler", () => {
  it("should delete a permission by name", async () => {
    (permissionService.deletePermission as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({ body: { name: "delete:posts" } });
    const res = createMockRes();
    const next = createMockNext();

    await deletePermissionHandler(req, res, next);

    expect(permissionService.deletePermission).toHaveBeenCalledWith(
      "delete:posts",
    );
    expect(res._json.data.message).toBe("Permission deleted");
  });
});
