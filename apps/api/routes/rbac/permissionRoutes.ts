import { Router } from "express";
import {
  checkHandler,
  grantHandler,
  revokeHandler,
  addPermissionHandler,
  deletePermissionHandler,
  getAllPermissionsHandler,
  getUserPermissionsHandler,
} from "~/controllers/rbac/permissionController";
import { adminWriteLimiter } from "~/utils";
import { authMiddleware, requireRole } from "~/middleware";

const permissionRouter = Router();

permissionRouter.use(authMiddleware, requireRole("admin"));

permissionRouter.get("/check", adminWriteLimiter, checkHandler);
permissionRouter.post("/grant", adminWriteLimiter, grantHandler);
permissionRouter.post("/revoke", adminWriteLimiter, revokeHandler);
permissionRouter.post("/add", adminWriteLimiter, addPermissionHandler);
permissionRouter.delete("/delete", adminWriteLimiter, deletePermissionHandler);
permissionRouter.get("/", adminWriteLimiter, getAllPermissionsHandler);
permissionRouter.get("/:userId", adminWriteLimiter, getUserPermissionsHandler);

export { permissionRouter };
