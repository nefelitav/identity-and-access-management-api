jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/profile/profileService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as profileService from "~/services/profile/profileService";
import {
  updateProfileHandler,
  deleteUserHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
  getUserHandler,
} from "~/controllers/profile/profileController";

beforeEach(() => jest.clearAllMocks());

describe("updateProfileHandler", () => {
  it("should call profileService.updateProfile with user data", async () => {
    const updated = { id: "u1", email: "new@test.com" };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(updated);

    const req = createMockReq({
      body: { email: "new@test.com", password: "P@ss1234!" },
      user: { userId: "u1", sessionId: "s1" },
      headers: { "user-agent": "jest" },
      ip: "1.2.3.4",
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await updateProfileHandler(req, res, next);

    expect(profileService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", email: "new@test.com" }),
    );
    expect(res._json.data).toEqual(updated);
  });
});

describe("deleteUserHandler", () => {
  it("should call profileService.deleteUser", async () => {
    (profileService.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await deleteUserHandler(req, res, next);

    expect(profileService.deleteUser).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual({ message: "User deleted" });
  });
});

describe("requestPasswordResetHandler", () => {
  it("should call profileService.requestPasswordReset", async () => {
    (profileService.requestPasswordReset as jest.Mock).mockResolvedValue(
      undefined,
    );

    const req = createMockReq({ body: { email: "user@test.com" } });
    const res = createMockRes();
    const next = createMockNext();

    await requestPasswordResetHandler(req, res, next);

    expect(profileService.requestPasswordReset).toHaveBeenCalledWith(
      "user@test.com",
    );
    expect(res._json.data.message).toContain("Password reset");
  });
});

describe("resetPasswordHandler", () => {
  it("should call profileService.resetPassword", async () => {
    (profileService.resetPassword as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({
      body: { resetToken: "tok", newPassword: "N3w!pass" },
    });
    const res = createMockRes();
    const next = createMockNext();

    await resetPasswordHandler(req, res, next);

    expect(profileService.resetPassword).toHaveBeenCalledWith(
      "tok",
      "N3w!pass",
    );
    expect(res._json.data.message).toContain("Password reset");
  });
});

describe("getUserHandler", () => {
  it("should return user data", async () => {
    const user = { id: "u1", email: "user@test.com" };
    (profileService.getUser as jest.Mock).mockResolvedValue(user);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await getUserHandler(req, res, next);

    expect(profileService.getUser).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual(user);
  });

  it("should forward errors to next", async () => {
    const err = new Error("not found");
    (profileService.getUser as jest.Mock).mockRejectedValue(err);

    const req = createMockReq({
      user: { userId: "u1", sessionId: "s1" },
    } as any);
    const res = createMockRes();
    const next = createMockNext();

    await getUserHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
