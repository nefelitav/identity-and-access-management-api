import { PrismaClient, Prisma } from "@prisma/client";
import { createLogger } from "~/utils";

const logger = createLogger("BaseRepository");

interface PaginationOptions {
  page: number;
  limit: number;
}

interface SortOptions {
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

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error(
        `Error finding ${this.modelName} by ID: ${id}`,
        error as Error,
      );
      throw error;
    }
  }

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
      const where = this.buildWhereClause(filters);

      const orderBy = this.buildOrderByClause(sortBy, sortOrder);

      const [data, total] = await Promise.all([
        (this.prisma as any)[this.modelName].findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        (this.prisma as any)[this.modelName].count({ where }),
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
        `Error finding ${this.modelName} with pagination`,
        error as Error,
      );
      throw error;
    }
  }

  async create(data: CreateInput): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].create({
        data,
      });
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, error as Error);
      throw error;
    }
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(
        `Error updating ${this.modelName} with ID: ${id}`,
        error as Error,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
    } catch (error) {
      logger.error(
        `Error deleting ${this.modelName} with ID: ${id}`,
        error as Error,
      );
      throw error;
    }
  }

  protected abstract buildWhereClause(filters: FilterOptions): any;
  protected abstract buildOrderByClause(
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ): any;

  async withTransaction<R>(
    callback: (tx: Prisma.TransactionClient) => Promise<R>,
  ): Promise<R> {
    return await this.prisma.$transaction(callback);
  }
}
