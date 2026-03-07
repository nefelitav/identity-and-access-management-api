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

jest.mock("~/services/admin/adminService");
jest.mock("~/services/profile/profileService");
jest.mock("~/utils/createLogger", () => () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

import request from "supertest";
import app from "~/app";
import * as adminService from "~/services/admin/adminService";
import * as profileService from "~/services/profile/profileService";
import { createValidToken } from "../helpers/tokenHelper";

const mockAdminService = adminService as jest.Mocked<typeof adminService>;
const mockProfileService = profileService as jest.Mocked<typeof profileService>;
const token = createValidToken("admin-id", "admin-session");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => jest.clearAllMocks());

describe("GET /admin/users", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/admin/users");
    expect(res.status).toBe(401);
  });

  it("should return 200 with paginated users", async () => {
    mockAdminService.getUsers.mockResolvedValue({
      data: [{ id: "u1", email: "a@b.com" }],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    } as any);

    const res = await request(app).get("/admin/users").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toHaveLength(1);
  });

  it("should pass query params to service", async () => {
    mockAdminService.getUsers.mockResolvedValue({
      data: [],
      pagination: {},
    } as any);

    await request(app).get("/admin/users?page=2&limit=5&search=john").set(auth);

    expect(mockAdminService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, search: "john" }),
    );
  });
});

describe("GET /admin/users/:id", () => {
  it("should return 400 for invalid UUID", async () => {
    const res = await request(app).get("/admin/users/not-a-uuid").set(auth);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 200 for valid UUID", async () => {
    mockProfileService.getUser.mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "a@b.com",
    } as any);

    const res = await request(app)
      .get("/admin/users/550e8400-e29b-41d4-a716-446655440000")
      .set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /admin/users/:id", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).delete(
      "/admin/users/550e8400-e29b-41d4-a716-446655440000",
    );
    expect(res.status).toBe(401);
  });

  it("should return 200 on successful delete", async () => {
    mockProfileService.deleteUser.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/admin/users/550e8400-e29b-41d4-a716-446655440000")
      .set(auth);

    expect(res.status).toBe(200);
  });
});

describe("DELETE /admin/users", () => {
  it("should return 200 on bulk delete", async () => {
    mockAdminService.deleteUsers.mockResolvedValue(undefined);

    const res = await request(app).delete("/admin/users").set(auth);

    expect(res.status).toBe(200);
  });
});
