import { Response } from "express";
import redisClient from "~/utils/redis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function healthCheck(res: Response) {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
  });
}

export async function readinessCheck(res: Response) {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  try {
    await redisClient.ping();
    checks.redis = true;
  } catch (error) {
    console.error("Redis health check failed:", error);
  }

  const isReady = checks.database && checks.redis;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    data: {
      status: isReady ? "ready" : "not ready",
      checks,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    },
  });
}
