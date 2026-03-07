jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    RbacRepository: { serviceIdentifier: Symbol("RbacRepository") },
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
import * as rbacService from "~/services/rbac/rbacService";

const mockRepo = {
  assignRoleToUser: jest.fn(),
  removeRoleFromUser: jest.fn(),
  getUserRoles: jest.fn(),
  getAllRoles: jest.fn(),
  createRole: jest.fn(),
  deleteRole: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockRepo);
});

describe("rbacService.assignRoleToUser", () => {
  it("should delegate to repo", async () => {
    mockRepo.assignRoleToUser.mockResolvedValue({ userId: "u1", roleId: "r1" });

    await rbacService.assignRoleToUser("u1", "admin");

    expect(mockRepo.assignRoleToUser).toHaveBeenCalledWith("u1", "admin");
  });
});

describe("rbacService.removeRoleFromUser", () => {
  it("should delegate to repo", async () => {
    mockRepo.removeRoleFromUser.mockResolvedValue(undefined);

    await rbacService.removeRoleFromUser("u1", "admin");

    expect(mockRepo.removeRoleFromUser).toHaveBeenCalledWith("u1", "admin");
  });
});

describe("rbacService.getUserRoles", () => {
  it("should return mapped role names", async () => {
    mockRepo.getUserRoles.mockResolvedValue([
      { role: { name: "admin" } },
      { role: { name: "user" } },
    ]);

    const roles = await rbacService.getUserRoles("u1");

    expect(roles).toEqual(["admin", "user"]);
  });

  it("should return empty array when no roles", async () => {
    mockRepo.getUserRoles.mockResolvedValue([]);

    const roles = await rbacService.getUserRoles("u1");

    expect(roles).toEqual([]);
  });
});

describe("rbacService.getAllRoles", () => {
  it("should return all roles from repo", async () => {
    const result = { data: [{ id: "r1", name: "admin" }], pagination: {} };
    mockRepo.getAllRoles.mockResolvedValue(result);

    const roles = await rbacService.getAllRoles();
    expect(roles).toEqual(result);
  });
});

describe("rbacService.createRole", () => {
  it("should create a role", async () => {
    const role = { id: "r1", name: "editor" };
    mockRepo.createRole.mockResolvedValue(role);

    const result = await rbacService.createRole("editor");
    expect(result).toEqual(role);
  });
});

describe("rbacService.deleteRole", () => {
  it("should delete a role", async () => {
    mockRepo.deleteRole.mockResolvedValue(undefined);

    await rbacService.deleteRole("editor");
    expect(mockRepo.deleteRole).toHaveBeenCalledWith("editor");
  });
});
