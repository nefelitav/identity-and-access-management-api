jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    UserRepository: { serviceIdentifier: Symbol("UserRepository") },
    SessionRepository: { serviceIdentifier: Symbol("SessionRepository") },
  },
}));

jest.mock("~/utils", () => ({
  generateTokens: jest
    .fn()
    .mockResolvedValue({ accessToken: "at", refreshToken: "rt" }),
  SALT: 10,
  sendEmail: jest.fn().mockResolvedValue(undefined),
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
  ResponseCode: { NOT_FOUND: 404 },
}));

jest.mock("~/utils/redis", () => ({
  __esModule: true,
  default: { set: jest.fn(), setEx: jest.fn(), get: jest.fn(), del: jest.fn() },
}));

jest.mock("~/services/session/sessionService", () => ({
  createSessionService: jest.fn().mockReturnValue({
    deleteAllSessions: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed-pw"),
}));

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

import { container } from "~/core";
import * as profileService from "~/services/profile/profileService";
import redis from "~/utils/redis";

const mockUserRepo = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn().mockResolvedValue(false),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockUserRepo);
});

describe("profileService.updateProfile", () => {
  it("should throw UserNotFoundException when userId is missing", async () => {
    await expect(profileService.updateProfile({})).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should throw when user not found in database", async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      profileService.updateProfile({ userId: "u1" }),
    ).rejects.toMatchObject({ name: "UserNotFoundException" });
  });

  it("should update email and return updated user", async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: "u1",
      email: "old@test.com",
    });
    mockUserRepo.existsByEmail.mockResolvedValue(false);
    mockUserRepo.update.mockResolvedValue({
      id: "u1",
      email: "new@test.com",
      updatedAt: new Date("2024-01-01"),
    });

    const result = await profileService.updateProfile({
      userId: "u1",
      email: "new@test.com",
    });

    expect(mockUserRepo.update).toHaveBeenCalledWith("u1", {
      email: "new@test.com",
    });
    expect(result).toHaveProperty("id", "u1");
    expect(result).toHaveProperty("email", "new@test.com");
    expect(result).toHaveProperty("updatedAt");
  });

  it("should hash password before updating", async () => {
    mockUserRepo.findById.mockResolvedValue({ id: "u1" });
    mockUserRepo.update.mockResolvedValue({
      id: "u1",
      updatedAt: new Date(),
    });

    await profileService.updateProfile({ userId: "u1", password: "NewP@ss1!" });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({ password: "hashed-pw" }),
    );
  });
});

describe("profileService.deleteUser", () => {
  it("should throw when userId is missing", async () => {
    await expect(profileService.deleteUser()).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should delete user and their sessions", async () => {
    mockUserRepo.delete.mockResolvedValue(undefined);

    await profileService.deleteUser("u1");

    expect(mockUserRepo.delete).toHaveBeenCalledWith("u1");
  });
});

describe("profileService.requestPasswordReset", () => {
  it("should throw when user not found", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      profileService.requestPasswordReset("missing@test.com"),
    ).rejects.toMatchObject({ name: "UserNotFoundException" });
  });

  it("should store token in redis and send email", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
    });

    await profileService.requestPasswordReset("user@test.com");

    expect(redis.setEx).toHaveBeenCalledWith(
      "passwordReset:mock-uuid",
      3600,
      "u1",
    );
    const { sendEmail } = require("~/utils");
    expect(sendEmail).toHaveBeenCalled();
  });
});

describe("profileService.resetPassword", () => {
  it("should throw when reset token is invalid", async () => {
    (redis.get as jest.Mock).mockResolvedValue(null);

    await expect(
      profileService.resetPassword("bad-token", "N3w!Pass1"),
    ).rejects.toMatchObject({ name: "UserNotFoundException" });
  });

  it("should hash new password and update user", async () => {
    (redis.get as jest.Mock).mockResolvedValue("u1");
    mockUserRepo.update.mockResolvedValue(undefined);

    await profileService.resetPassword("valid-tok", "N3w!Pass1");

    expect(mockUserRepo.update).toHaveBeenCalledWith("u1", {
      password: "hashed-pw",
    });
    expect(redis.del).toHaveBeenCalledWith("passwordReset:valid-tok");
  });
});

describe("profileService.getUser", () => {
  it("should throw when userId is missing", async () => {
    await expect(profileService.getUser()).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should throw when user not found", async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(profileService.getUser("u1")).rejects.toMatchObject({
      name: "UserNotFoundException",
    });
  });

  it("should return user when found", async () => {
    const user = { id: "u1", email: "a@b.com" };
    mockUserRepo.findById.mockResolvedValue(user);

    const result = await profileService.getUser("u1");
    expect(result).toEqual(user);
  });
});
