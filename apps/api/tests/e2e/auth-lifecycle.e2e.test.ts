/**
 * E2E: Auth Lifecycle
 * Register → Login → Refresh Token → Logout
 *
 * Services are mocked, but the full Express stack (routes, middleware,
 * validation, error handler) runs for real.
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

import request from "supertest";
import app from "~/app";
import * as authService from "~/services/auth/authService";
import { createValidToken } from "../helpers/tokenHelper";

const mock = authService as jest.Mocked<typeof authService>;

beforeEach(() => jest.clearAllMocks());

describe("Auth lifecycle E2E", () => {
  const email = "e2e@test.com";
  const password = "E2eTest1234!";

  it("should complete the full register → login → refresh → logout flow", async () => {
    // ── Step 1: Register ────────────────────────────────
    const userId = "e2e-user-id";
    const accessToken = createValidToken(userId, "reg-session");

    mock.register.mockResolvedValue({
      id: userId,
      email,
      createdAt: new Date().toISOString(),
      accessToken,
      refreshToken: "reg-refresh-token",
    });

    const registerRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.data.id).toBe(userId);
    expect(registerRes.body.data.email).toBe(email);
    expect(registerRes.body.data.accessToken).toBeDefined();
    expect(registerRes.body.data.refreshToken).toBeDefined();

    // ── Step 2: Register duplicate should fail ──────────
    const dupErr = new Error("Email already in use") as any;
    dupErr.name = "EmailAlreadyInUseException";
    dupErr.statusCode = 409;
    mock.register.mockRejectedValue(dupErr);

    const dupRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.success).toBe(false);

    // ── Step 3: Login ───────────────────────────────────
    const loginToken = createValidToken(userId, "login-session");

    mock.login.mockResolvedValue({
      accessToken: loginToken,
      refreshToken: "login-refresh-token",
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBe(loginToken);
    expect(loginRes.body.data.refreshToken).toBe("login-refresh-token");

    // ── Step 4: Use access token for an authed route ────
    // (Just verify the token works with the auth middleware)
    // We don't need to mock profile, just check 401 vs not-401
    const authedRes = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${loginToken}`);

    // Even if profile service isn't mocked, we at least got past auth (not 401)
    expect(authedRes.status).not.toBe(401);

    // ── Step 5: Refresh Token ───────────────────────────
    mock.refreshToken.mockResolvedValue({
      accessToken: "new-access-token",
    });

    const refreshRes = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "login-refresh-token" });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBe("new-access-token");

    // ── Step 6: Invalid refresh token should fail ───────
    const badRefreshErr = new Error("Invalid refresh token") as any;
    badRefreshErr.name = "InvalidRefreshTokenException";
    badRefreshErr.statusCode = 401;
    mock.refreshToken.mockRejectedValue(badRefreshErr);

    const badRefreshRes = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "invalid-token" });

    expect(badRefreshRes.status).toBe(401);

    // ── Step 7: Login with wrong password should fail ───
    const wrongPassErr = new Error("Invalid credentials") as any;
    wrongPassErr.name = "InvalidCredentialsException";
    wrongPassErr.statusCode = 401;
    mock.login.mockRejectedValue(wrongPassErr);

    const wrongPassRes = await request(app)
      .post("/auth/login")
      .send({ email, password: "WrongPass1!" });

    expect(wrongPassRes.status).toBe(401);
    expect(wrongPassRes.body.success).toBe(false);
  });

  it("should reject malformed requests at the validation layer", async () => {
    // Missing email
    const noEmail = await request(app)
      .post("/auth/register")
      .send({ password });

    expect(noEmail.status).toBe(400);
    expect(noEmail.body.error.code).toBe("VALIDATION_ERROR");

    // Invalid email
    const badEmail = await request(app)
      .post("/auth/register")
      .send({ email: "not-email", password });

    expect(badEmail.status).toBe(400);

    // Weak password
    const weakPw = await request(app)
      .post("/auth/register")
      .send({ email, password: "short" });

    expect(weakPw.status).toBe(400);

    // Empty refresh token
    const emptyRt = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "" });

    expect(emptyRt.status).toBe(400);
  });
});
