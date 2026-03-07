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

import request from "supertest";
import app from "~/app";
import * as authService from "~/services/auth/authService";

const mockAuthService = authService as jest.Mocked<typeof authService>;

beforeEach(() => jest.clearAllMocks());

describe("POST /auth/register", () => {
  it("should return 201 with user data on successful registration", async () => {
    mockAuthService.register.mockResolvedValue({
      id: "u1",
      email: "test@test.com",
      createdAt: "2025-01-01T00:00:00.000Z",
      accessToken: "at",
      refreshToken: "rt",
    });

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "Test1234!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@test.com");
    expect(res.body.data.accessToken).toBe("at");
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ password: "Test1234!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when password is too weak", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "not-an-email", password: "Test1234!" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 409 when email already exists", async () => {
    const err = new Error("Email already in use") as any;
    err.name = "EmailAlreadyInUseException";
    err.statusCode = 409;
    mockAuthService.register.mockRejectedValue(err);

    const res = await request(app)
      .post("/auth/register")
      .send({ email: "taken@test.com", password: "Test1234!" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /auth/login", () => {
  it("should return 200 with tokens on valid credentials", async () => {
    mockAuthService.login.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBe("at");
    expect(res.body.data.refreshToken).toBe("rt");
  });

  it("should return 400 on missing email", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ password: "Test1234!" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 on invalid credentials", async () => {
    const err = new Error("Invalid credentials") as any;
    err.name = "InvalidCredentialsException";
    err.statusCode = 401;
    mockAuthService.login.mockRejectedValue(err);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "Wrong1234!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 423 on locked account", async () => {
    const err = new Error("Account locked") as any;
    err.name = "AccountLockedException";
    err.statusCode = 423;
    mockAuthService.login.mockRejectedValue(err);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "locked@test.com", password: "Test1234!" });

    expect(res.status).toBe(423);
  });

  it("should accept optional remember field", async () => {
    mockAuthService.login.mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
    });

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "Test1234!", remember: true });

    expect(res.status).toBe(200);
    expect(mockAuthService.login).toHaveBeenCalledWith(
      expect.objectContaining({ remember: true }),
    );
  });
});

describe("POST /auth/refresh-token", () => {
  it("should return 200 with new access token", async () => {
    mockAuthService.refreshToken.mockResolvedValue({
      accessToken: "new-at",
    });

    const res = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "valid-rt" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("new-at");
  });

  it("should return 400 when refreshToken is missing", async () => {
    const res = await request(app).post("/auth/refresh-token").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 on invalid refresh token", async () => {
    const err = new Error("Invalid refresh token") as any;
    err.name = "InvalidRefreshTokenException";
    err.statusCode = 401;
    mockAuthService.refreshToken.mockRejectedValue(err);

    const res = await request(app)
      .post("/auth/refresh-token")
      .send({ refreshToken: "bad-token" });

    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("should return 401 when no authorization header is provided", async () => {
    const res = await request(app).post("/auth/logout").send({});

    expect(res.status).toBe(401);
  });
});
