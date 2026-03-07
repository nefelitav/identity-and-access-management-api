/**
 * E2E: Profile Management
 * Login → Get Profile → Update Profile → Request Password Reset
 * → Reset Password → Delete Account
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

jest.mock("~/services/auth/authService");
jest.mock("~/services/profile/profileService");

import request from "supertest";
import app from "~/app";
import * as authService from "~/services/auth/authService";
import * as profileService from "~/services/profile/profileService";
import { createValidToken } from "../helpers/tokenHelper";

const mockAuth = authService as jest.Mocked<typeof authService>;
const mockProfile = profileService as jest.Mocked<typeof profileService>;

beforeEach(() => jest.clearAllMocks());

describe("Profile management E2E", () => {
  const userId = "profile-user-id";
  const email = "profile@test.com";

  it("should complete login → view profile → update → password reset → delete flow", async () => {
    const accessToken = createValidToken(userId, "profile-session");

    // ── Step 1: Login ───────────────────────────────────
    mockAuth.login.mockResolvedValue({
      accessToken,
      refreshToken: "rt",
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "Test1234!" });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    // ── Step 2: Get Profile ─────────────────────────────
    mockProfile.getUser.mockResolvedValue({
      id: userId,
      email,
      createdAt: "2025-01-01T00:00:00.000Z",
    } as any);

    const profileRes = await request(app).get("/profile").set(auth);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.email).toBe(email);

    // ── Step 3: Update Profile (email) ──────────────────
    const newEmail = "updated@test.com";
    mockProfile.updateProfile.mockResolvedValue({
      accessToken: "new-at",
      refreshToken: "new-rt",
    } as any);

    const updateRes = await request(app)
      .put("/profile")
      .set(auth)
      .send({ email: newEmail });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.accessToken).toBe("new-at");

    // ── Step 4: Request Password Reset ──────────────────
    mockProfile.requestPasswordReset.mockResolvedValue(undefined);

    const resetReqRes = await request(app)
      .post("/profile/request-password-reset")
      .set(auth)
      .send({ email: newEmail });

    expect(resetReqRes.status).toBe(200);

    // ── Step 5: Reset Password ──────────────────────────
    mockProfile.resetPassword.mockResolvedValue(undefined);

    const resetRes = await request(app)
      .post("/profile/password-reset")
      .set(auth)
      .send({ token: "reset-token-123", newPassword: "NewPass1234!" });

    expect(resetRes.status).toBe(200);

    // ── Step 6: Delete Account ──────────────────────────
    mockProfile.deleteUser.mockResolvedValue(undefined);

    const deleteRes = await request(app).delete("/profile").set(auth);

    expect(deleteRes.status).toBe(200);

    // ── Step 7: Verify unauthenticated access is blocked ─
    const noAuthRes = await request(app).get("/profile");
    expect(noAuthRes.status).toBe(401);
  });
});
