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

jest.mock("~/services/mfa/totpService");
jest.mock("~/services/mfa/otpService");

import request from "supertest";
import app from "~/app";
import * as totpService from "~/services/mfa/totpService";
import * as otpService from "~/services/mfa/otpService";
import { createValidToken } from "../helpers/tokenHelper";

const mockTotpService = totpService as jest.Mocked<typeof totpService>;
const mockOtpService = otpService as jest.Mocked<typeof otpService>;
const token = createValidToken("u1", "s1");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => jest.clearAllMocks());

// ── TOTP ──────────────────────────────────────────────

describe("POST /mfa/totp/enable", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).post("/mfa/totp/enable");
    expect(res.status).toBe(401);
  });

  it("should return 201 with QR code", async () => {
    mockTotpService.generateSecret.mockResolvedValue({
      qrCode: "data:image/png;base64,abc",
      secret: "JBSWY3DPEHPK3PXP",
    } as any);

    const res = await request(app).post("/mfa/totp/enable").set(auth);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.qrCode).toBeDefined();
  });
});

describe("POST /mfa/totp/confirm", () => {
  it("should return 200 when token is valid", async () => {
    mockTotpService.confirmAndEnable.mockResolvedValue(true);

    const res = await request(app)
      .post("/mfa/totp/confirm")
      .set(auth)
      .send({ userId: "u1", token: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /mfa/totp/verify", () => {
  it("should return 200 with isValid true", async () => {
    mockTotpService.verifyCode.mockResolvedValue(true);

    const res = await request(app)
      .post("/mfa/totp/verify")
      .set(auth)
      .send({ userId: "u1", token: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("POST /mfa/totp/disable", () => {
  it("should return 200 on disable", async () => {
    mockTotpService.disable.mockResolvedValue(undefined as any);

    const res = await request(app)
      .post("/mfa/totp/disable")
      .set(auth)
      .send({ userId: "u1" });

    expect(res.status).toBe(200);
  });
});

// ── OTP ───────────────────────────────────────────────

describe("POST /mfa/otp/request-email", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/request-email")
      .send({ email: "user@test.com" });

    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockOtpService.generateAndSendCodeViaEmail.mockResolvedValue(
      undefined as any,
    );

    const res = await request(app)
      .post("/mfa/otp/request-email")
      .set(auth)
      .send({ email: "user@test.com" });

    expect(res.status).toBe(200);
  });
});

describe("POST /mfa/otp/request-sms", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/request-sms")
      .send({ phone: "+1234567890" });

    expect(res.status).toBe(401);
  });

  it("should return 200 on success", async () => {
    mockOtpService.generateAndSendCodeViaSms.mockResolvedValue(
      undefined as any,
    );

    const res = await request(app)
      .post("/mfa/otp/request-sms")
      .set(auth)
      .send({ phone: "+1234567890" });

    expect(res.status).toBe(200);
  });
});

describe("POST /mfa/otp/verify", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post("/mfa/otp/verify")
      .send({ code: "123456" });

    expect(res.status).toBe(401);
  });

  it("should return 200 with isValid true", async () => {
    mockOtpService.verifyCode.mockResolvedValue(true);

    const res = await request(app)
      .post("/mfa/otp/verify")
      .set(auth)
      .send({ code: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
