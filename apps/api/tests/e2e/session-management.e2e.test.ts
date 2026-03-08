/**
 * E2E: Session Management
 * Login → List Sessions → Delete One Session → Delete All Sessions
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
jest.mock("~/services/session/sessionService");

import request from "supertest";
import app from "~/app";
import * as authService from "~/services/auth/authService";
import { createSessionService } from "~/services/session/sessionService";
import { createValidToken } from "../helpers/tokenHelper";

const mockAuth = authService as jest.Mocked<typeof authService>;

const mockSessionService = {
  getSessions: jest.fn(),
  deleteSession: jest.fn(),
  deleteAllSessions: jest.fn(),
  createSession: jest.fn(),
  getSessionByToken: jest.fn(),
  updateLastActive: jest.fn(),
};

(createSessionService as jest.Mock).mockReturnValue(mockSessionService);

beforeEach(() => {
  jest.clearAllMocks();
  (createSessionService as jest.Mock).mockReturnValue(mockSessionService);
});

describe("Session management E2E", () => {
  const userId = "session-user-id";

  it("should list sessions, delete one, and delete all", async () => {
    const accessToken = createValidToken(userId, "s1");
    const auth = { Authorization: `Bearer ${accessToken}` };

    // ── Step 1: Login ───────────────────────────────────
    mockAuth.login.mockResolvedValue({
      accessToken,
      refreshToken: "rt-1",
    });

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "session@test.com", password: "Test1234!" });

    expect(loginRes.status).toBe(200);

    // ── Step 2: List Sessions ───────────────────────────
    const sessions = [
      {
        id: "s1",
        userAgent: "Jest/1",
        ipAddress: "127.0.0.1",
        createdAt: new Date("2025-01-01"),
        lastActiveAt: new Date("2025-01-02"),
      },
      {
        id: "s2",
        userAgent: "Jest/2",
        ipAddress: "192.168.1.1",
        createdAt: new Date("2025-01-03"),
        lastActiveAt: new Date("2025-01-04"),
      },
    ];

    mockSessionService.getSessions.mockResolvedValue(sessions);

    const listRes = await request(app).get("/sessions").set(auth);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);

    // ── Step 3: Delete One Session ──────────────────────
    mockSessionService.deleteSession.mockResolvedValue(undefined);

    const deleteOneRes = await request(app).delete("/sessions/s2").set(auth);

    expect(deleteOneRes.status).toBe(200);
    expect(mockSessionService.deleteSession).toHaveBeenCalledWith("s2");

    // ── Step 4: Delete All Sessions ─────────────────────
    mockSessionService.deleteAllSessions.mockResolvedValue(undefined);

    const deleteAllRes = await request(app).delete("/sessions").set(auth);

    expect(deleteAllRes.status).toBe(200);

    // ── Step 5: Unauthenticated access blocked ──────────
    const noAuthRes = await request(app).get("/sessions");
    expect(noAuthRes.status).toBe(401);
  });
});
