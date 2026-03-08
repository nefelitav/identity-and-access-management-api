jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/rbac/rbacService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as rbacService from "~/services/rbac/rbacService";
import {
  assignRoleHandler,
  removeRoleHandler,
  getRolesHandler,
  getAllRolesHandler,
  createRoleHandler,
  deleteRoleHandler,
} from "~/controllers/rbac/rbacController";

beforeEach(() => jest.clearAllMocks());

describe("assignRoleHandler", () => {
  it("should assign a role to a user", async () => {
    (rbacService.assignRoleToUser as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({ body: { userId: "u1", role: "admin" } });
    const res = createMockRes();
    const next = createMockNext();

    await assignRoleHandler(req, res, next);

    expect(rbacService.assignRoleToUser).toHaveBeenCalledWith("u1", "admin");
    expect(res._json.data.message).toBe("Role assigned");
  });
});

describe("removeRoleHandler", () => {
  it("should remove a role from a user", async () => {
    (rbacService.removeRoleFromUser as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({ body: { userId: "u1", role: "admin" } });
    const res = createMockRes();
    const next = createMockNext();

    await removeRoleHandler(req, res, next);

    expect(rbacService.removeRoleFromUser).toHaveBeenCalledWith("u1", "admin");
    expect(res._json.data.message).toBe("Role removed");
  });
});

describe("getRolesHandler", () => {
  it("should return roles for a user", async () => {
    (rbacService.getUserRoles as jest.Mock).mockResolvedValue([
      "admin",
      "user",
    ]);

    const req = createMockReq({ params: { userId: "u1" } });
    const res = createMockRes();
    const next = createMockNext();

    await getRolesHandler(req, res, next);

    expect(rbacService.getUserRoles).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual({ roles: ["admin", "user"] });
  });
});

describe("getAllRolesHandler", () => {
  it("should return all roles", async () => {
    const roles = { data: [{ id: "r1", name: "admin" }], pagination: {} };
    (rbacService.getAllRoles as jest.Mock).mockResolvedValue(roles);

    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    await getAllRolesHandler(req, res, next);

    expect(rbacService.getAllRoles).toHaveBeenCalled();
    expect(res._json.data).toEqual({ roles });
  });
});

describe("createRoleHandler", () => {
  it("should create a new role", async () => {
    const role = { id: "r1", name: "editor" };
    (rbacService.createRole as jest.Mock).mockResolvedValue(role);

    const req = createMockReq({ body: { name: "editor" } });
    const res = createMockRes();
    const next = createMockNext();

    await createRoleHandler(req, res, next);

    expect(rbacService.createRole).toHaveBeenCalledWith("editor");
    expect(res._json.data).toEqual({ role });
  });
});

describe("deleteRoleHandler", () => {
  it("should delete a role by name", async () => {
    (rbacService.deleteRole as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({ body: { name: "editor" } });
    const res = createMockRes();
    const next = createMockNext();

    await deleteRoleHandler(req, res, next);

    expect(rbacService.deleteRole).toHaveBeenCalledWith("editor");
    expect(res._json.data.message).toBe("Role deleted");
  });
});
