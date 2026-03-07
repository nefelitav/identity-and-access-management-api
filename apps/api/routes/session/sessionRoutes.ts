import { Router } from "express";
import {
  listSessionsHandler,
  deleteSessionHandler,
  deleteAllSessionsHandler,
} from "~/controllers/session/sessionController";
import { authMiddleware } from "~/middleware";
import { sessionLimiter } from "~/utils";

const sessionRouter = Router();

sessionRouter.get("/", authMiddleware, sessionLimiter, listSessionsHandler);
sessionRouter.delete(
  "/:sessionId",
  authMiddleware,
  sessionLimiter,
  deleteSessionHandler,
);
sessionRouter.delete(
  "/",
  authMiddleware,
  sessionLimiter,
  deleteAllSessionsHandler,
);

export { sessionRouter };
