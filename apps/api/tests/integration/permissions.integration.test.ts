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

jest.mock("~/services/rbac/permissionService");

import request from "supertest";
import app from "~/app";
import * as permissionService from "~/services/rbac/permissionService";
import { createValidToken } from "../helpers/tokenHelper";

const mockPermService = permissionService as jest.Mocked<
  typeof permissionService
>;
const token = createValidToken("u1", "s1");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => jest.clearAllMocks());

describe("GET /permissions/check", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get(
      "/permissions/check?userId=u1&permission=read",
    );
    expect(res.status).toBe(401);
  });

  it("should return 200 with allowed status", async () => {
    mockPermService.checkPermission.mockResolvedValue(true);

    const res = await request(app)
      .get("/permissions/check?userId=u1&permission=read")
      .set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /permissions/grant", () => {
  it("should return 200 on granting permission", async () => {
    mockPermService.grantPermission.mockResolvedValue(undefined as any);

    const res = await request(app)
      .post("/permissions/grant")
      .set(auth)
      .send({ roleId: "r1", permission: "read:users" });

    expect(res.status).toBe(200);
  });
});

describe("POST /permissions/revoke", () => {
  it("should return 200 on revoking permission", async () => {
    mockPermService.revokePermissionFromRole.mockResolvedValue(
      undefined as any,
    );

    const res = await request(app)
      .post("/permissions/revoke")
      .set(auth)
      .send({ roleId: "r1", permission: "read:users" });

    expect(res.status).toBe(200);
  });
});

describe("POST /permissions/add", () => {
  it("should return 200 on adding a permission", async () => {
    mockPermService.addPermission.mockResolvedValue({
      id: "p1",
      name: "write:users",
    } as any);

    const res = await request(app)
      .post("/permissions/add")
      .set(auth)
      .send({ name: "write:users" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /permissions/delete", () => {
  it("should return 200 on deleting a permission", async () => {
    mockPermService.deletePermission.mockResolvedValue(undefined as any);

    const res = await request(app)
      .delete("/permissions/delete")
      .set(auth)
      .send({ name: "write:users" });

    expect(res.status).toBe(200);
  });
});

describe("GET /permissions", () => {
  it("should return 200 with all permissions", async () => {
    mockPermService.getAllPermissions.mockResolvedValue([
      { id: "p1", name: "read" },
    ] as any);

    const res = await request(app).get("/permissions").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("GET /permissions/:userId", () => {
  it("should return 200 with user permissions", async () => {
    mockPermService.getUserPermissions.mockResolvedValue([
      {
        rolePermissions: [
          { permission: { id: "p1", name: "read" } },
          { permission: { id: "p2", name: "write" } },
        ],
      },
    ] as any);

    const res = await request(app).get("/permissions/u1").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
