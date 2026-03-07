import bcrypt from "bcryptjs";

// Mock all external dependencies before imports
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
      UserRepository: { serviceIdentifier: Symbol("UserRepository") },
      SessionRepository: { serviceIdentifier: Symbol("SessionRepository") },
    },
  };
});

jest.mock("~/utils", () => ({
  generateTokens: jest.fn().mockResolvedValue({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  }),
  JWT_EXPIRY: 900,
  JWT_SECRET: "test-secret-key-that-is-long-enough",
  SALT: 10,
  sendEmail: jest.fn().mockResolvedValue(undefined),
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

jest.mock("~/services/session/sessionService", () => ({
  createSessionService: jest.fn().mockReturnValue({
    createSession: jest.fn().mockResolvedValue({}),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    deleteAllSessions: jest.fn().mockResolvedValue(undefined),
    getSessionByToken: jest.fn(),
    updateLastActive: jest.fn(),
  }),
  SessionService: {
    createSession: jest.fn().mockResolvedValue({}),
    deleteSession: jest.fn().mockResolvedValue(undefined),
    deleteAllSessions: jest.fn().mockResolvedValue(undefined),
  },
}));

import { container } from "~/core";
import * as authService from "~/services/auth/authService";

const mockUserRepo = {
  findByEmail: jest.fn(),
  existsByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateFailedAttempts: jest.fn(),
  resetFailedAttempts: jest.fn(),
  withTransaction: jest.fn((cb: any) =>
    cb({ session: { findFirst: jest.fn().mockResolvedValue(null) } }),
  ),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockUserRepo);
});

describe("authService.register", () => {
  it("should throw EmailAlreadyInUseException when email exists", async () => {
    mockUserRepo.existsByEmail.mockResolvedValue(true);
    mockUserRepo.withTransaction.mockImplementation((cb: any) => cb({}));

    await expect(
      authService.register({ email: "taken@test.com", password: "P@ssw0rd!" }),
    ).rejects.toMatchObject({ name: "EmailAlreadyInUseException" });
  });

  it("should create a user and return tokens on success", async () => {
    mockUserRepo.existsByEmail.mockResolvedValue(false);
    mockUserRepo.create.mockResolvedValue({
      id: "u1",
      email: "new@test.com",
      createdAt: new Date("2024-01-01"),
    });
    mockUserRepo.withTransaction.mockImplementation((cb: any) => cb({}));

    const result = await authService.register({
      email: "new@test.com",
      password: "P@ssw0rd!",
    });

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result.email).toBe("new@test.com");
  });
});

describe("authService.login", () => {
  const mockUser = {
    id: "u1",
    email: "user@test.com",
    password: "",
    failedLoginAttempts: 0,
    lockoutUntil: null,
  };

  beforeEach(async () => {
    mockUser.password = await bcrypt.hash("P@ssw0rd!", 10);
  });

  it("should throw InvalidCredentialsException when user not found", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.withTransaction.mockImplementation((cb: any) =>
      cb({ session: { findFirst: jest.fn().mockResolvedValue(null) } }),
    );

    await expect(
      authService.login({
        email: "missing@test.com",
        password: "P@ssw0rd!",
      }),
    ).rejects.toMatchObject({ name: "InvalidCredentialsException" });
  });

  it("should throw AccountLockedException when account is locked", async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    mockUserRepo.findByEmail.mockResolvedValue({
      ...mockUser,
      lockoutUntil: futureDate,
    });
    mockUserRepo.withTransaction.mockImplementation((cb: any) =>
      cb({ session: { findFirst: jest.fn().mockResolvedValue(null) } }),
    );

    await expect(
      authService.login({ email: "user@test.com", password: "P@ssw0rd!" }),
    ).rejects.toMatchObject({ name: "AccountLockedException" });
  });

  it("should throw InvalidCredentialsException on wrong password", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockUserRepo.withTransaction.mockImplementation((cb: any) =>
      cb({ session: { findFirst: jest.fn().mockResolvedValue(null) } }),
    );

    await expect(
      authService.login({
        email: "user@test.com",
        password: "WrongPassword1!",
      }),
    ).rejects.toMatchObject({ name: "InvalidCredentialsException" });

    expect(mockUserRepo.updateFailedAttempts).toHaveBeenCalled();
  });
});

describe("authService.logout", () => {
  it("should throw when neither sessionId nor userId provided", async () => {
    await expect(authService.logout({})).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });
});
