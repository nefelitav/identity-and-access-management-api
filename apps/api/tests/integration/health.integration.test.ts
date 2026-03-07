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

import request from "supertest";
import app from "~/app";

describe("GET /health", () => {
  it("should return 200 with healthy status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.timestamp).toBeDefined();
    expect(res.body.data.uptime).toBeGreaterThan(0);
  });
});

describe("404 – unknown routes", () => {
  it("should not match an unknown GET path", async () => {
    const res = await request(app).get("/this-does-not-exist");

    // Express default 404
    expect(res.status).toBe(404);
  });
});
