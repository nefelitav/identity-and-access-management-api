import { Router } from "express";
import {
  listSessionsHandler,
  deleteSessionHandler,
  deleteAllSessionsHandler,
} from "~/controllers/session/sessionController";
import { authMiddleware } from "~/middleware";
import { sessionLimiter } from "~/utils";

const sessionRouter = Router();

sessionRouter.get("/", sessionLimiter, authMiddleware, listSessionsHandler);
sessionRouter.delete(
  "/:sessionId",
  sessionLimiter,
  authMiddleware,
  deleteSessionHandler,
);
sessionRouter.delete(
  "/",
  sessionLimiter,
  authMiddleware,
  deleteAllSessionsHandler,
);

export { sessionRouter };
