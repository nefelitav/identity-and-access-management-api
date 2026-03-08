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

jest.mock("~/middleware/requireRole", () => ({
  requireRole: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock("~/services/rbac/rbacService");

import request from "supertest";
import app from "~/app";
import * as rbacService from "~/services/rbac/rbacService";
import { createValidToken } from "../helpers/tokenHelper";

const mockRbacService = rbacService as jest.Mocked<typeof rbacService>;
const token = createValidToken("u1", "s1");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => jest.clearAllMocks());

describe("POST /roles/assign", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post("/roles/assign")
      .send({ userId: "u1", roleName: "admin" });
    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockRbacService.assignRoleToUser.mockResolvedValue(undefined as any);

    const res = await request(app)
      .post("/roles/assign")
      .set(auth)
      .send({ userId: "u1", roleName: "admin" });

    expect(res.status).toBe(200);
  });
});

describe("DELETE /roles/remove", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .delete("/roles/remove")
      .send({ userId: "u1", roleName: "admin" });
    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockRbacService.removeRoleFromUser.mockResolvedValue(undefined as any);

    const res = await request(app)
      .delete("/roles/remove")
      .set(auth)
      .send({ userId: "u1", roleName: "admin" });

    expect(res.status).toBe(200);
  });
});

describe("GET /roles", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/roles");
    expect(res.status).toBe(401);
  });

  it("should return 200 with all roles", async () => {
    mockRbacService.getAllRoles.mockResolvedValue({
      data: [{ id: "r1", name: "admin" }],
      pagination: { page: 1, limit: 10, total: 1 },
    } as any);

    const res = await request(app).get("/roles").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /roles/:userId", () => {
  it("should return 200 with user roles", async () => {
    mockRbacService.getUserRoles.mockResolvedValue([
      { id: "r1", name: "admin" },
    ] as any);

    const res = await request(app).get("/roles/some-user-id").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /roles/add", () => {
  it("should return 200 on creating a role", async () => {
    mockRbacService.createRole.mockResolvedValue({
      id: "r1",
      name: "editor",
    } as any);

    const res = await request(app)
      .post("/roles/add")
      .set(auth)
      .send({ name: "editor" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /roles/delete", () => {
  it("should return 200 on deleting a role", async () => {
    mockRbacService.deleteRole.mockResolvedValue(undefined as any);

    const res = await request(app)
      .delete("/roles/delete")
      .set(auth)
      .send({ name: "editor" });

    expect(res.status).toBe(200);
  });
});
