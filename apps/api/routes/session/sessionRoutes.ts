import { Router } from "express";
import { SessionController } from "~/controllers";
import { authMiddleware } from "~/middleware";

const sessionRouter = Router();

sessionRouter.get("/", authMiddleware, SessionController.listSessions);
sessionRouter.delete(
  "/:sessionId",
  authMiddleware,
  SessionController.deleteSession,
);
sessionRouter.delete("/", authMiddleware, SessionController.deleteAllSessions);

export default sessionRouter;
