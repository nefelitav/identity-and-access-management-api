import { PrismaClient, Prisma } from "@prisma/client";
import { createLogger } from "~/utils";

const logger = createLogger("BaseRepository");

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterOptions {
  search?: string;
  [key: string]: any;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseRepository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>;
  findMany(
    options?: Partial<PaginationOptions & SortOptions & FilterOptions>,
  ): Promise<PaginatedResult<T>>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<T>;
  withTransaction<R>(
    callback: (tx: Prisma.TransactionClient) => Promise<R>,
  ): Promise<R>;
}

/**
 * Create a base repository with standard CRUD operations.
 *
 * @param prisma  – PrismaClient instance
 * @param modelName – The Prisma model delegate name (e.g. "user")
 * @param buildWhereClause – Converts filter options into a Prisma `where` object
 * @param buildOrderByClause – Converts sort options into a Prisma `orderBy` object
 */
export function createBaseRepository<T, CreateInput, UpdateInput>(
  prisma: PrismaClient,
  modelName: string,
  buildWhereClause: (filters: FilterOptions) => any,
  buildOrderByClause: (sortBy?: string, sortOrder?: "asc" | "desc") => any,
): BaseRepository<T, CreateInput, UpdateInput> {
  const model = (prisma as any)[modelName];

  return {
    async findById(id: string): Promise<T | null> {
      try {
        return await model.findUnique({ where: { id } });
      } catch (error) {
        logger.error(`Error finding ${modelName} by ID: ${id}`, error as Error);
        throw error;
      }
    },

    async findMany(
      options: Partial<PaginationOptions & SortOptions & FilterOptions> = {},
    ): Promise<PaginatedResult<T>> {
      const {
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = "desc",
        ...filters
      } = options;
      const skip = (page - 1) * limit;

      try {
        const where = buildWhereClause(filters);
        const orderBy = buildOrderByClause(sortBy, sortOrder);

        const [data, total] = await Promise.all([
          model.findMany({ where, orderBy, skip, take: limit }),
          model.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        };
      } catch (error) {
        logger.error(
          `Error finding ${modelName} with pagination`,
          error as Error,
        );
        throw error;
      }
    },

    async create(data: CreateInput): Promise<T> {
      try {
        return await model.create({ data });
      } catch (error) {
        logger.error(`Error creating ${modelName}`, error as Error);
        throw error;
      }
    },

    async update(id: string, data: UpdateInput): Promise<T> {
      try {
        return await model.update({ where: { id }, data });
      } catch (error) {
        logger.error(
          `Error updating ${modelName} with ID: ${id}`,
          error as Error,
        );
        throw error;
      }
    },

    async delete(id: string): Promise<T> {
      try {
        return await model.delete({ where: { id } });
      } catch (error) {
        logger.error(
          `Error deleting ${modelName} with ID: ${id}`,
          error as Error,
        );
        throw error;
      }
    },

    async withTransaction<R>(
      callback: (tx: Prisma.TransactionClient) => Promise<R>,
    ): Promise<R> {
      return await prisma.$transaction(callback);
    },
  };
}
