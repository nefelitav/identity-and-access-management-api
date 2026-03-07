jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/session/sessionService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import { createSessionService } from "~/services/session/sessionService";
import {
  listSessionsHandler,
  deleteSessionHandler,
  deleteAllSessionsHandler,
} from "~/controllers/session/sessionController";

const mockService = {
  getSessions: jest.fn(),
  deleteSession: jest.fn(),
  deleteAllSessions: jest.fn(),
};

(createSessionService as jest.Mock).mockReturnValue(mockService);
beforeEach(() => jest.clearAllMocks());

describe("listSessionsHandler", () => {
  it("should return mapped sessions for the user", async () => {
    const now = new Date();
    mockService.getSessions.mockResolvedValue([
      {
        id: "s1",
        userId: "u1",
        userAgent: "Chrome",
        ipAddress: "1.2.3.4",
        createdAt: now,
        lastActiveAt: now,
      },
    ]);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await listSessionsHandler(req, res, next);

    expect(mockService.getSessions).toHaveBeenCalledWith("u1");
    expect(res._json.data.sessions).toHaveLength(1);
    expect(res._json.data.sessions[0]).toHaveProperty("id", "s1");
    expect(res._json.data.sessions[0]).toHaveProperty("ip", "1.2.3.4");
  });
});

describe("deleteSessionHandler", () => {
  it("should delete a session by ID", async () => {
    mockService.deleteSession.mockResolvedValue(undefined);

    const req = createMockReq({ body: { params: { sessionId: "s1" } } });
    const res = createMockRes();
    const next = createMockNext();

    await deleteSessionHandler(req, res, next);

    expect(mockService.deleteSession).toHaveBeenCalledWith("s1");
    expect(res._json.data).toEqual({ message: "Session deleted" });
  });
});

describe("deleteAllSessionsHandler", () => {
  it("should delete all sessions for the user", async () => {
    mockService.deleteAllSessions.mockResolvedValue(undefined);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await deleteAllSessionsHandler(req, res, next);

    expect(mockService.deleteAllSessions).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual({ message: "All sessions deleted" });
  });
});
