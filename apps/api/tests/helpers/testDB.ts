/**
 * Shared helpers for integration / e2e tests that run against a real
 * PostgreSQL + Redis test stack (docker-compose.test.yml).
 */
import { PrismaClient } from "@prisma/client";
import { createClient, RedisClientType } from "redis";
import { execSync } from "child_process";
import path from "path";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { initializeServices } from "~/core/serviceFactory";

/** Resolve the Prisma schema path relative to this file. */
function schemaPath(): string {
  // Works from both monorepo root and apps/api
  return path.resolve(
    __dirname,
    "../../../../packages/prisma/prisma/schema.prisma",
  );
}

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:test_password@localhost:5433/identity_forge_test";

const TEST_REDIS_URL =
  process.env.TEST_REDIS_URL ||
  process.env.REDIS_URL ||
  "redis://localhost:6380";

let prisma: PrismaClient;
let redis: RedisClientType;

/** Boot the DI container with real Postgres + Redis for tests. */
export async function setupTestDB() {
  // Override env so every module that reads process.env picks up test values
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.REDIS_URL = TEST_REDIS_URL;

  // Silence email sending during tests
  process.env.SMTP_HOST = "";

  // Ensure the DB schema is up to date (idempotent, safe to run every time)
  try {
    execSync(
      `npx prisma db push --skip-generate --accept-data-loss --schema=${schemaPath()}`,
      {
        env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
        stdio: "pipe",
      },
    );
  } catch {
    // If prisma CLI fails (e.g. schema already up to date), continue
  }

  prisma = new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  });
  await prisma.$connect();

  redis = createClient({ url: TEST_REDIS_URL }) as RedisClientType;
  await redis.connect();

  // Bind real infra into the DI container
  container.bind(SERVICE_IDENTIFIERS.DatabaseClient, prisma);
  container.bind(SERVICE_IDENTIFIERS.RedisClient, redis);

  // Register repositories (they read DatabaseClient from the container)
  initializeServices();

  return { prisma, redis };
}

/** Wipe every table so each test suite starts clean. */
export async function cleanDB() {
  // Use Prisma deleteMany in dependency order (children first)
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.session.deleteMany();
  await prisma.mfaSecret.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Flush Redis
  try {
    await redis.flushDb();
  } catch {
    // Redis may already be disconnected during teardown
  }
}

/** Disconnect everything after the suite finishes. */
export async function teardownTestDB() {
  try {
    await prisma?.$disconnect();
  } catch {
    // Already disconnected or never connected
  }
  try {
    await redis?.quit();
  } catch {
    // Already closed or never connected
  }
}

/** Re-export for convenience. */
export function getPrisma() {
  return prisma;
}
export function getRedis() {
  return redis;
}
