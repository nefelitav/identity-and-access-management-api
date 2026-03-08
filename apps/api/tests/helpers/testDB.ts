import { PrismaClient } from "@prisma/client";
import { createClient, RedisClientType } from "redis";
import { execSync } from "child_process";
import path from "path";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import { initializeServices } from "~/core/serviceFactory";
import redisUtil from "~/utils/redis";

function schemaPath(): string {
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

export async function setupTestDB() {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.REDIS_URL = TEST_REDIS_URL;
  process.env.SMTP_HOST = "";

  try {
    execSync(
      `npx prisma db push --skip-generate --accept-data-loss --schema=${schemaPath()}`,
      {
        env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
        stdio: "pipe",
      },
    );
  } catch {
    // Schema already up to date
  }

  prisma = new PrismaClient({
    datasources: { db: { url: TEST_DATABASE_URL } },
  });
  await prisma.$connect();

  redis = createClient({ url: TEST_REDIS_URL }) as RedisClientType;
  await redis.connect();

  container.bind(SERVICE_IDENTIFIERS.DatabaseClient, prisma);
  container.bind(SERVICE_IDENTIFIERS.RedisClient, redis);
  initializeServices();

  return { prisma, redis };
}

export async function cleanDB() {
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.session.deleteMany();
  await prisma.mfaSecret.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  try {
    await redis.flushDb();
  } catch {}
}

export async function teardownTestDB() {
  try {
    await prisma?.$disconnect();
  } catch {}
  try {
    await redis?.quit();
  } catch {}
  try {
    await redisUtil.quit();
  } catch {}
}

export function getPrisma() {
  return prisma;
}

export function getRedis() {
  return redis;
}
