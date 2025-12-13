import { Router } from "express";
import { healthCheck, readinessCheck } from "~/controllers";

const healthRouter = Router();

healthRouter.get("/health", healthCheck);
healthRouter.get("/ready", readinessCheck);

export { healthRouter };
