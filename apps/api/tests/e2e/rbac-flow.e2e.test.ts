/**
 * E2E: RBAC Flow
 * Login → Create Role → Assign Role → Grant Permission → Check Permission
 * → Revoke Permission → Remove Role → Delete Role
 */

jest.mock("~/utils/rateLimiting", () => {
  const pass = (_req: any, _res: any, next: any) => next();
  return {
    loginLimiter: pass,
    registerLimiter: pass,
    refreshLimiter: pass,
    logoutLimiter: pass,
    captchaLimiter: pass,
    otpRequestLimiter: pass,
    otpVerifyLimiter: pass,
    totpSetupLimiter: pass,
    totpVerifyLimiter: pass,
    passwordResetLimiter: pass,
    adminWriteLimiter: pass,
    sessionLimiter: pass,
  };
});

jest.mock("~/utils/createLogger", () => () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock("~/services/auth/authService");
jest.mock("~/services/rbac/rbacService");
jest.mock("~/services/rbac/permissionService");

import request from "supertest";
import app from "~/app";
import * as authService from "~/services/auth/authService";
import * as rbacService from "~/services/rbac/rbacService";
import * as permissionService from "~/services/rbac/permissionService";
import { createValidToken } from "../helpers/tokenHelper";

const mockAuth = authService as jest.Mocked<typeof authService>;
const mockRbac = rbacService as jest.Mocked<typeof rbacService>;
const mockPerm = permissionService as jest.Mocked<typeof permissionService>;

beforeEach(() => jest.clearAllMocks());

describe("RBAC flow E2E", () => {
  const adminId = "admin-user-id";
  const targetUserId = "target-user-id";

  it("should manage roles and permissions end-to-end", async () => {
    const accessToken = createValidToken(adminId, "admin-session");
    const auth = { Authorization: `Bearer ${accessToken}` };

    // ── Step 1: Login as admin ──────────────────────────
    mockAuth.login.mockResolvedValue({
      accessToken,
      refreshToken: "admin-rt",
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "admin@test.com", password: "Admin1234!" });

    expect(loginRes.status).toBe(200);

    // ── Step 2: Create Role ─────────────────────────────
    mockRbac.createRole.mockResolvedValue({
      id: "role-1",
      name: "editor",
    } as any);

    const createRoleRes = await request(app)
      .post("/roles/add")
      .set(auth)
      .send({ name: "editor" });

    expect(createRoleRes.status).toBe(200);
    expect(createRoleRes.body.data.role.name).toBe("editor");

    // ── Step 3: List All Roles ──────────────────────────
    mockRbac.getAllRoles.mockResolvedValue({
      data: [
        { id: "role-1", name: "editor" },
        { id: "role-2", name: "admin" },
      ],
    } as any);

    const listRolesRes = await request(app).get("/roles").set(auth);

    expect(listRolesRes.status).toBe(200);
    expect(listRolesRes.body.data.roles.data).toHaveLength(2);

    // ── Step 4: Assign Role to User ─────────────────────
    mockRbac.assignRoleToUser.mockResolvedValue(undefined as any);

    const assignRes = await request(app)
      .post("/roles/assign")
      .set(auth)
      .send({ userId: targetUserId, role: "editor" });

    expect(assignRes.status).toBe(200);

    // ── Step 5: Get User Roles ──────────────────────────
    mockRbac.getUserRoles.mockResolvedValue(["editor"] as any);

    const userRolesRes = await request(app)
      .get(`/roles/${targetUserId}`)
      .set(auth);

    expect(userRolesRes.status).toBe(200);
    expect(userRolesRes.body.data.roles).toHaveLength(1);

    // ── Step 6: Add Permission ──────────────────────────
    mockPerm.addPermission.mockResolvedValue({
      id: "p1",
      name: "write:articles",
    } as any);

    const addPermRes = await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "write:articles" });

    expect(addPermRes.status).toBe(200);
    expect(addPermRes.body.data.message).toBe("Permission added");

    // ── Step 7: Grant Permission to Role ────────────────
    mockPerm.grantPermission.mockResolvedValue(undefined as any);

    const grantRes = await request(app)
      .post("/permissions/grant")
      .set(auth)
      .send({ roleId: "role-1", permission: "write:articles" });

    expect(grantRes.status).toBe(200);

    // ── Step 8: Check Permission ────────────────────────
    mockPerm.checkPermission.mockResolvedValue(true);

    const checkRes = await request(app)
      .get(
        `/permissions/check?userId=${targetUserId}&permission=write:articles`,
      )
      .set(auth);

    expect(checkRes.status).toBe(200);
    expect(checkRes.body.success).toBe(true);

    // ── Step 9: Revoke Permission ───────────────────────
    mockPerm.revokePermissionFromRole.mockResolvedValue(undefined as any);

    const revokeRes = await request(app)
      .post("/permissions/revoke")
      .set(auth)
      .send({ roleId: "role-1", permission: "write:articles" });

    expect(revokeRes.status).toBe(200);

    // ── Step 10: Remove Role from User ──────────────────
    mockRbac.removeRoleFromUser.mockResolvedValue(undefined as any);

    const removeRoleRes = await request(app)
      .delete("/roles/remove")
      .set(auth)
      .send({ userId: targetUserId, role: "editor" });

    expect(removeRoleRes.status).toBe(200);

    // ── Step 11: Delete Role ────────────────────────────
    mockRbac.deleteRole.mockResolvedValue(undefined as any);

    const deleteRoleRes = await request(app)
      .delete("/roles/delete")
      .set(auth)
      .send({ name: "editor" });

    expect(deleteRoleRes.status).toBe(200);

    // ── Step 12: Delete Permission ──────────────────────
    mockPerm.deletePermission.mockResolvedValue(undefined as any);

    const deletePermRes = await request(app)
      .delete("/permissions/delete")
      .set(auth)
      .send({ name: "write:articles" });

    expect(deletePermRes.status).toBe(200);

    // ── Step 13: Auth guard blocks unauthenticated ──────
    const noAuthRes = await request(app).get("/roles");
    expect(noAuthRes.status).toBe(401);
  });
});
