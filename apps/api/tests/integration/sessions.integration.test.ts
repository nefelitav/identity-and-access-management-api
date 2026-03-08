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

jest.mock("~/services/session/sessionService");

import request from "supertest";
import app from "~/app";
import { createSessionService } from "~/services/session/sessionService";
import { createValidToken } from "../helpers/tokenHelper";

const mockSessionService = {
  getSessions: jest.fn(),
  deleteSession: jest.fn(),
  deleteAllSessions: jest.fn(),
};

(createSessionService as jest.Mock).mockReturnValue(mockSessionService);

const token = createValidToken("u1", "s1");
const auth = { Authorization: `Bearer ${token}` };

beforeEach(() => {
  jest.clearAllMocks();
  (createSessionService as jest.Mock).mockReturnValue(mockSessionService);
});

describe("GET /sessions", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).get("/sessions");
    expect(res.status).toBe(401);
  });

  it("should return 200 with session list", async () => {
    mockSessionService.getSessions.mockResolvedValue([
      {
        id: "s1",
        userAgent: "jest",
        ipAddress: "127.0.0.1",
        createdAt: new Date(),
        lastActiveAt: new Date(),
      },
    ]);

    const res = await request(app).get("/sessions").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("DELETE /sessions/:sessionId", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app).delete("/sessions/s1");
    expect(res.status).toBe(401);
  });

  it("should return 200 on successful delete", async () => {
    mockSessionService.deleteSession.mockResolvedValue(undefined);

    const res = await request(app).delete("/sessions/s1").set(auth);

    expect(res.status).toBe(200);
  });
});

describe("DELETE /sessions", () => {
  it("should return 200 when deleting all sessions", async () => {
    mockSessionService.deleteAllSessions.mockResolvedValue(undefined);

    const res = await request(app).delete("/sessions").set(auth);

    expect(res.status).toBe(200);
  });
});
