import { Router } from "express";
import { healthCheck, readinessCheck } from "~/controllers";

const router = Router();

router.get("/health", healthCheck);
router.get("/ready", readinessCheck);

export default router;
