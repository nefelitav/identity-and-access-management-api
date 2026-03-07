jest.mock("~/utils", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import { createBaseRepository } from "~/repositories/base/BaseRepository";

function createMockModel() {
  return {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createMockPrisma(model: any) {
  return {
    testModel: model,
    $transaction: jest.fn((cb: any) => cb({})),
  } as any;
}

const buildWhere = (f: any) =>
  f.search ? { name: { contains: f.search } } : {};
const buildOrderBy = (sortBy?: string, order: "asc" | "desc" = "asc") =>
  sortBy ? { [sortBy]: order } : { createdAt: "desc" };

describe("createBaseRepository", () => {
  it("findById should call model.findUnique", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.findUnique.mockResolvedValue({ id: "1", name: "Test" });

    const result = await repo.findById("1");

    expect(model.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("findById should return null when not found", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.findUnique.mockResolvedValue(null);

    const result = await repo.findById("missing");
    expect(result).toBeNull();
  });

  it("findMany should return paginated results", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.findMany.mockResolvedValue([{ id: "1" }, { id: "2" }]);
    model.count.mockResolvedValue(15);

    const result = await repo.findMany({ page: 2, limit: 5 });

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.total).toBe(15);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrev).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it("findMany should default to page 1, limit 10", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.findMany.mockResolvedValue([]);
    model.count.mockResolvedValue(0);

    const result = await repo.findMany();

    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("create should call model.create", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    const data = { name: "New" };
    model.create.mockResolvedValue({ id: "1", ...data });

    const result = (await repo.create(data)) as any;

    expect(model.create).toHaveBeenCalledWith({ data });
    expect(result.name).toBe("New");
  });

  it("update should call model.update", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.update.mockResolvedValue({ id: "1", name: "Updated" });

    const result = (await repo.update("1", { name: "Updated" } as any)) as any;

    expect(model.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { name: "Updated" },
    });
    expect(result.name).toBe("Updated");
  });

  it("delete should call model.delete", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.delete.mockResolvedValue({ id: "1" });

    const result = (await repo.delete("1")) as any;

    expect(model.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    expect(result.id).toBe("1");
  });

  it("withTransaction should delegate to prisma.$transaction", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    prisma.$transaction.mockImplementation(async (cb: any) => cb("tx-client"));

    const result = await repo.withTransaction(async (tx) => {
      expect(tx).toBe("tx-client");
      return "done";
    });

    expect(result).toBe("done");
  });

  it("should propagate errors from model methods", async () => {
    const model = createMockModel();
    const prisma = createMockPrisma(model);
    const repo = createBaseRepository(
      prisma,
      "testModel",
      buildWhere,
      buildOrderBy,
    );

    model.findUnique.mockRejectedValue(new Error("DB error"));

    await expect(repo.findById("1")).rejects.toThrow("DB error");
  });
});
