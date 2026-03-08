import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { container, SERVICE_IDENTIFIERS } from "~/core";
import redisClient from "~/utils/redis";

export async function healthCheck(_req: Request, res: Response) {
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

export async function readinessCheck(_req: Request, res: Response) {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const prisma = container.get<PrismaClient>(
      SERVICE_IDENTIFIERS.DatabaseClient,
    );
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
