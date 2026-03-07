jest.mock("~/core", () => {
  const mockContainer = {
    get: jest.fn(),
    bind: jest.fn(),
    bindFactory: jest.fn(),
    bindSingleton: jest.fn(),
    isBound: jest.fn(),
  };
  return {
    container: mockContainer,
    SERVICE_IDENTIFIERS: {
      SessionRepository: { serviceIdentifier: Symbol("SessionRepository") },
    },
  };
});

jest.mock("~/utils", () => ({
  hashToken: jest.fn((t: string) => `hashed_${t}`),
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
  ResponseCode: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
}));

import { container } from "~/core";
import { createSessionService } from "~/services/session/sessionService";

const mockSessionRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByToken: jest.fn(),
  deleteAll: jest.fn(),
  updateLastActive: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockSessionRepo);
});

describe("createSessionService", () => {
  it("should create a session with hashed refresh token", async () => {
    mockSessionRepo.create.mockResolvedValue({ id: "session-1" });

    const service = createSessionService();
    await service.createSession("user-1", "raw-token", "Chrome", "1.2.3.4");

    expect(mockSessionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        refreshToken: "hashed_raw-token",
        userAgent: "Chrome",
        ipAddress: "1.2.3.4",
      }),
    );
  });

  it("should look up sessions by hashed token", async () => {
    mockSessionRepo.findByToken.mockResolvedValue({ id: "s1" });

    const service = createSessionService();
    const result = await service.getSessionByToken("my-token");

    expect(mockSessionRepo.findByToken).toHaveBeenCalledWith("hashed_my-token");
    expect(result).toEqual({ id: "s1" });
  });

  it("should throw UserNotFoundException when getSessions has no userId", async () => {
    const service = createSessionService();

    await expect(service.getSessions(undefined)).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should return all sessions for a user", async () => {
    mockSessionRepo.findAll.mockResolvedValue([{ id: "s1" }, { id: "s2" }]);

    const service = createSessionService();
    const sessions = await service.getSessions("user-1");

    expect(sessions).toHaveLength(2);
    expect(mockSessionRepo.findAll).toHaveBeenCalledWith("user-1");
  });

  it("should delete a single session by ID", async () => {
    mockSessionRepo.findById.mockResolvedValue({ id: "s1" });
    mockSessionRepo.delete.mockResolvedValue({ id: "s1" });

    const service = createSessionService();
    await service.deleteSession("s1");

    expect(mockSessionRepo.delete).toHaveBeenCalledWith("s1");
  });

  it("should skip delete if session not found", async () => {
    mockSessionRepo.findById.mockResolvedValue(null);

    const service = createSessionService();
    await service.deleteSession("nonexistent");

    expect(mockSessionRepo.delete).not.toHaveBeenCalled();
  });

  it("should delete all sessions for a user", async () => {
    mockSessionRepo.deleteAll.mockResolvedValue({ count: 3 });

    const service = createSessionService();
    await service.deleteAllSessions("user-1");

    expect(mockSessionRepo.deleteAll).toHaveBeenCalledWith("user-1");
  });

  it("should throw UserNotFoundException when deleteAllSessions has no userId", async () => {
    const service = createSessionService();

    await expect(service.deleteAllSessions(undefined)).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should update last active timestamp", async () => {
    mockSessionRepo.updateLastActive.mockResolvedValue({ id: "s1" });

    const service = createSessionService();
    await service.updateLastActive("s1");

    expect(mockSessionRepo.updateLastActive).toHaveBeenCalledWith("s1");
  });
});
