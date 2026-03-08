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
import { authMiddleware, requireRole } from "~/middleware";

const rbacRouter = Router();

rbacRouter.use(authMiddleware, requireRole("admin"));

rbacRouter.post("/assign", adminWriteLimiter, assignRoleHandler);
rbacRouter.delete("/remove", adminWriteLimiter, removeRoleHandler);
rbacRouter.get("/:userId", adminWriteLimiter, getRolesHandler);
rbacRouter.get("/", adminWriteLimiter, getAllRolesHandler);
rbacRouter.delete("/delete", adminWriteLimiter, deleteRoleHandler);
rbacRouter.post("/add", adminWriteLimiter, createRoleHandler);

export { rbacRouter };
