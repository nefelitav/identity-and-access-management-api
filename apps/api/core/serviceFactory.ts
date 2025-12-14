import { PrismaClient } from "@prisma/client";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { CaptchaService } from "~/services";
import { createLogger } from "~/utils";

export class ServiceFactory {
  private static instance: ServiceFactory;
  private initialized = false;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    if (!container.isBound(SERVICE_IDENTIFIERS.DatabaseClient)) {
      this.registerInfrastructure();
    }
    this.registerRepositories();
    this.registerServices();
    this.registerExternalServices();
    this.registerApplicationServices();

    this.initialized = true;
  }

  private registerInfrastructure(): void {
    // Database
    container.bindSingleton(SERVICE_IDENTIFIERS.DatabaseClient, () => {
      return new PrismaClient({
        log: ["query", "info", "warn", "error"],
      });
    });

    // Redis
    container.bindSingleton(SERVICE_IDENTIFIERS.RedisClient, () => {
      const Redis = require("ioredis");
      return new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    });

    // Logger
    container.bindSingleton(SERVICE_IDENTIFIERS.Logger, () => {
      return createLogger("Application");
    });
  }

  private registerRepositories(): void {
    container.bindFactory(SERVICE_IDENTIFIERS.UserRepository, () => {
      const prisma = container.get<PrismaClient>(
        SERVICE_IDENTIFIERS.DatabaseClient,
      );
      return new UserRepository(prisma);
    });
  }

  private registerServices(): void {}

  private registerExternalServices(): void {
    container.bindFactory(SERVICE_IDENTIFIERS.CaptchaService, () => {
      return new CaptchaService();
    });
  }

  private registerApplicationServices(): void {}
}

export const serviceFactory = ServiceFactory.getInstance();
