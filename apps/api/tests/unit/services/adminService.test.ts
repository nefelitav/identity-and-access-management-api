jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    UserRepository: { serviceIdentifier: Symbol("UserRepository") },
  },
}));

jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { container } from "~/core";
import * as adminService from "~/services/admin/adminService";

const mockUserRepo = {
  findMany: jest.fn(),
  delete: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockReturnValue(mockUserRepo);
});

describe("adminService.getUsers", () => {
  it("should delegate to userRepository.findMany with params", async () => {
    const result = { data: [{ id: "u1" }], pagination: { total: 1 } };
    mockUserRepo.findMany.mockResolvedValue(result);

    const params = { page: 2, limit: 5, search: "test", role: "admin" };
    const res = await adminService.getUsers(params);

    expect(mockUserRepo.findMany).toHaveBeenCalledWith(params);
    expect(res).toEqual(result);
  });
});

describe("adminService.deleteUsers", () => {
  it("should delete all users returned by findMany", async () => {
    mockUserRepo.findMany.mockResolvedValue({
      data: [{ id: "u1" }, { id: "u2" }],
    });
    mockUserRepo.delete.mockResolvedValue(undefined);

    await adminService.deleteUsers();

    expect(mockUserRepo.delete).toHaveBeenCalledTimes(2);
    expect(mockUserRepo.delete).toHaveBeenCalledWith("u1");
    expect(mockUserRepo.delete).toHaveBeenCalledWith("u2");
  });

  it("should handle empty user list", async () => {
    mockUserRepo.findMany.mockResolvedValue({ data: [] });

    await adminService.deleteUsers();

    expect(mockUserRepo.delete).not.toHaveBeenCalled();
  });
});
