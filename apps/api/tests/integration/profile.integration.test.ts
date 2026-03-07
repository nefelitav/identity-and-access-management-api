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

jest.mock("~/services/profile/profileService");

import request from "supertest";
import app from "~/app";
import * as profileService from "~/services/profile/profileService";
import { createValidToken, createExpiredToken } from "../helpers/tokenHelper";

const mockProfileService = profileService as jest.Mocked<typeof profileService>;
const validToken = createValidToken("u1", "s1");

beforeEach(() => jest.clearAllMocks());

describe("GET /profile", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).get("/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 401 with expired token", async () => {
    const expired = createExpiredToken();
    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(401);
  });

  it("should return 200 with user data when authenticated", async () => {
    mockProfileService.getUser.mockResolvedValue({
      id: "u1",
      email: "test@test.com",
      createdAt: "2025-01-01",
    } as any);

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@test.com");
  });
});

describe("PUT /profile", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app)
      .put("/profile")
      .send({ email: "new@test.com" });

    expect(res.status).toBe(401);
  });

  it("should return 200 on valid profile update", async () => {
    mockProfileService.updateProfile.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
    } as any);

    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ email: "new@test.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /profile", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).delete("/profile");

    expect(res.status).toBe(401);
  });

  it("should return 200 on successful deletion", async () => {
    mockProfileService.deleteUser.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
  });
});

describe("POST /profile/request-password-reset", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).post("/profile/request-password-reset");

    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockProfileService.requestPasswordReset.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/profile/request-password-reset")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ email: "test@test.com" });

    expect(res.status).toBe(200);
  });
});

describe("POST /profile/password-reset", () => {
  it("should return 401 without auth token", async () => {
    const res = await request(app).post("/profile/password-reset");

    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockProfileService.resetPassword.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/profile/password-reset")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ token: "reset-token", newPassword: "NewPass1234!" });

    expect(res.status).toBe(200);
  });
});
