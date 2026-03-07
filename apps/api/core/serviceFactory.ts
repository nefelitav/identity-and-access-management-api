import { PrismaClient } from "@prisma/client";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { createUserRepository } from "~/repositories/auth/userRepository";
import { createSessionRepository } from "~/repositories/session/sessionRepository";
import { createRbacRepository } from "~/repositories/rbac/rbacRepository";
import { createPermissionsRepository } from "~/repositories/rbac/permissionsRepository";
import { createTotpRepository } from "~/repositories/mfa/totpRepository";
import { createLogger } from "~/utils";

let initialized = false;

/** Register all application dependencies in the DI container. */
export function initializeServices(): void {
  if (initialized) return;

  if (!container.isBound(SERVICE_IDENTIFIERS.DatabaseClient)) {
    registerInfrastructure();
  }
  registerRepositories();

  initialized = true;
}

function registerInfrastructure(): void {
  container.bindSingleton(SERVICE_IDENTIFIERS.DatabaseClient, () => {
    return new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  });

  container.bindSingleton(SERVICE_IDENTIFIERS.RedisClient, () => {
    const Redis = require("ioredis");
    return new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  });

  container.bindSingleton(SERVICE_IDENTIFIERS.Logger, () => {
    return createLogger("Application");
  });
}

function registerRepositories(): void {
  const getPrisma = () =>
    container.get<PrismaClient>(SERVICE_IDENTIFIERS.DatabaseClient);

  container.bindFactory(SERVICE_IDENTIFIERS.UserRepository, () =>
    createUserRepository(getPrisma()),
  );

  container.bindFactory(SERVICE_IDENTIFIERS.SessionRepository, () =>
    createSessionRepository(getPrisma()),
  );

  container.bindFactory(SERVICE_IDENTIFIERS.RbacRepository, () =>
    createRbacRepository(getPrisma()),
  );

  container.bindFactory(SERVICE_IDENTIFIERS.PermissionRepository, () =>
    createPermissionsRepository(getPrisma()),
  );

  container.bindFactory(SERVICE_IDENTIFIERS.TotpRepository, () =>
    createTotpRepository(getPrisma()),
  );
}
