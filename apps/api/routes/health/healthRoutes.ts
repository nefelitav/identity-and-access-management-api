import { Router } from "express";
import { healthCheck, readinessCheck } from "~/controllers";
import { healthLimiter } from "~/utils";

const healthRouter = Router();

healthRouter.get("/health", healthLimiter, healthCheck);
healthRouter.get("/ready", healthLimiter, readinessCheck);

export { healthRouter };
