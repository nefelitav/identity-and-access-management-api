import { Router } from "express";
import {
  assignRoleHandler,
  removeRoleHandler,
  getRolesHandler,
  getAllRolesHandler,
  deleteRoleHandler,
  createRoleHandler,
} from "~/controllers/rbac/rbacController";
import { adminWriteLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const rbacRouter = Router();

rbacRouter.post(
  "/assign",
  authMiddleware,
  adminWriteLimiter,
  assignRoleHandler,
);
rbacRouter.delete(
  "/remove",
  authMiddleware,
  adminWriteLimiter,
  removeRoleHandler,
);
rbacRouter.get("/:userId", authMiddleware, adminWriteLimiter, getRolesHandler);
rbacRouter.get("/", authMiddleware, adminWriteLimiter, getAllRolesHandler);
rbacRouter.delete(
  "/delete",
  authMiddleware,
  adminWriteLimiter,
  deleteRoleHandler,
);
rbacRouter.post("/add", authMiddleware, adminWriteLimiter, createRoleHandler);

export { rbacRouter };
