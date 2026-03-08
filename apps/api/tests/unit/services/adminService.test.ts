jest.mock("~/core", () => ({
  container: { get: jest.fn() },
  SERVICE_IDENTIFIERS: {
    UserRepository: { serviceIdentifier: Symbol("UserRepository") },
    DatabaseClient: { serviceIdentifier: Symbol("DatabaseClient") },
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

import { container, SERVICE_IDENTIFIERS } from "~/core";
import * as adminService from "~/services/admin/adminService";

const mockUserRepo = {
  findMany: jest.fn(),
  delete: jest.fn(),
};

const mockPrisma = {
  user: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (container.get as jest.Mock).mockImplementation((id: any) => {
    if (id === SERVICE_IDENTIFIERS.DatabaseClient) return mockPrisma;
    return mockUserRepo;
  });
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
  it("should call prisma.user.deleteMany()", async () => {
    mockPrisma.user.deleteMany.mockResolvedValue({ count: 3 });

    await adminService.deleteUsers();

    expect(mockPrisma.user.deleteMany).toHaveBeenCalled();
  });
});
