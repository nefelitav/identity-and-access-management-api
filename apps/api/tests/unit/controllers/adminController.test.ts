jest.mock("~/utils", () => ({
  ResponseCode: { OK: 200 },
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/utils/createLogger", () => ({
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock("~/services/admin/adminService");
jest.mock("~/services/profile/profileService");

import {
  createMockReq,
  createMockRes,
  createMockNext,
} from "../../helpers/mockHelpers";
import * as adminService from "~/services/admin/adminService";
import * as profileService from "~/services/profile/profileService";
import {
  getUserHandler,
  getUsersHandler,
  deleteUsersHandler,
  deleteUserHandler,
  updateProfileHandler,
} from "~/controllers/admin/adminController";

beforeEach(() => jest.clearAllMocks());

describe("adminController.getUserHandler", () => {
  it("should fetch a user by params.id", async () => {
    const user = { id: "u1", email: "a@b.com" };
    (profileService.getUser as jest.Mock).mockResolvedValue(user);

    const req = createMockReq({ params: { id: "u1" } });
    const res = createMockRes();
    const next = createMockNext();

    await getUserHandler(req, res, next);

    expect(profileService.getUser).toHaveBeenCalledWith("u1");
    expect(res._json.data).toEqual(user);
  });
});

describe("adminController.getUsersHandler", () => {
  it("should pass pagination and filter params", async () => {
    const result = { data: [{ id: "u1" }], pagination: {} };
    (adminService.getUsers as jest.Mock).mockResolvedValue(result);

    const req = createMockReq({
      query: { page: "2", limit: "5", search: "test", role: "admin" } as any,
    });
    const res = createMockRes();
    const next = createMockNext();

    await getUsersHandler(req, res, next);

    expect(adminService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 5,
        search: "test",
        role: "admin",
      }),
    );
    expect(res._json.data).toEqual(result);
  });

  it("should default page to 1 and limit to 10", async () => {
    (adminService.getUsers as jest.Mock).mockResolvedValue({
      data: [],
      pagination: {},
    });

    const req = createMockReq({ query: {} as any });
    const res = createMockRes();
    const next = createMockNext();

    await getUsersHandler(req, res, next);

    expect(adminService.getUsers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });
});

describe("adminController.deleteUsersHandler", () => {
  it("should delete all users and return sendStatus", async () => {
    (adminService.deleteUsers as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    await deleteUsersHandler(req, res, next);

    expect(adminService.deleteUsers).toHaveBeenCalled();
  });
});

describe("adminController.deleteUserHandler", () => {
  it("should delete a user by params.id", async () => {
    (profileService.deleteUser as jest.Mock).mockResolvedValue(undefined);

    const req = createMockReq({ params: { id: "u1" } });
    const res = createMockRes();
    const next = createMockNext();

    await deleteUserHandler(req, res, next);

    expect(profileService.deleteUser).toHaveBeenCalledWith("u1");
  });
});

describe("adminController.updateProfileHandler", () => {
  it("should update profile for a user by params.id", async () => {
    const updated = { id: "u1", email: "updated@test.com" };
    (profileService.updateProfile as jest.Mock).mockResolvedValue(updated);

    const req = createMockReq({
      params: { id: "u1" },
      body: { email: "updated@test.com", password: "Abc!1234" },
      headers: { "user-agent": "jest" },
      ip: "10.0.0.1",
    });
    const res = createMockRes();
    const next = createMockNext();

    await updateProfileHandler(req, res, next);

    expect(profileService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", email: "updated@test.com" }),
    );
    expect(res._json.data).toEqual(updated);
  });
});
