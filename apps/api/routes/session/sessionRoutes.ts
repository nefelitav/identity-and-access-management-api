import { Router } from "express";
import { SessionController } from "~/controllers";
import { authMiddleware } from "~/middleware";
import { sessionLimiter } from "~/utils";

const sessionRouter = Router();

sessionRouter.get(
  "/",
  authMiddleware,
  sessionLimiter,
  SessionController.listSessions,
);
sessionRouter.delete(
  "/:sessionId",
  authMiddleware,
  sessionLimiter,
  SessionController.deleteSession,
);
sessionRouter.delete(
  "/",
  authMiddleware,
  sessionLimiter,
  SessionController.deleteAllSessions,
);

export default sessionRouter;
