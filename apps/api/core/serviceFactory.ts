import { PrismaClient } from "@prisma/client";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { UserRepository } from "~/repositories";
import { EmailService } from "~/services";
import { SmsService } from "~/services";
import { CaptchaService } from "~/services";
import { CacheService } from "~/services";
import { InMemoryEventBus, InMemoryEventStore } from "~/core";
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

    this.registerInfrastructure();
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

    // Event System
    container.bindSingleton(SERVICE_IDENTIFIERS.EventBus, () => {
      return new InMemoryEventBus();
    });

    container.bindSingleton(SERVICE_IDENTIFIERS.EventStore, () => {
      return new InMemoryEventStore();
    });

    // Cache Service
    container.bindFactory(SERVICE_IDENTIFIERS.CacheService, () => {
      const redisClient = container.get<any>(SERVICE_IDENTIFIERS.RedisClient);
      const logger = container.get<any>(SERVICE_IDENTIFIERS.Logger);
      const { RedisCacheStrategy } = require("~/services");
      const strategy = new RedisCacheStrategy(redisClient, logger);
      return new CacheService(strategy, logger);
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

  private registerServices(): void {
    // Services are used statically, so no DI registration needed
  }

  private registerExternalServices(): void {
    container.bindFactory(SERVICE_IDENTIFIERS.EmailService, () => {
      return new EmailService();
    });

    container.bindFactory(SERVICE_IDENTIFIERS.SmsService, () => {
      return new SmsService();
    });

    container.bindFactory(SERVICE_IDENTIFIERS.CaptchaService, () => {
      return new CaptchaService();
    });
  }

  private registerApplicationServices(): void {
    // Event handlers are registered in app.ts
  }
}

// Initialize the factory
export const serviceFactory = ServiceFactory.getInstance();
