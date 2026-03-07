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
import { authMiddleware } from "~/middleware";

const permissionRouter = Router();

permissionRouter.get("/check", authMiddleware, adminWriteLimiter, checkHandler);
permissionRouter.post(
  "/grant",
  authMiddleware,
  adminWriteLimiter,
  grantHandler,
);
permissionRouter.post(
  "/revoke",
  authMiddleware,
  adminWriteLimiter,
  revokeHandler,
);
permissionRouter.post(
  "/add",
  authMiddleware,
  adminWriteLimiter,
  addPermissionHandler,
);
permissionRouter.delete(
  "/delete",
  authMiddleware,
  adminWriteLimiter,
  deletePermissionHandler,
);
permissionRouter.get(
  "/",
  authMiddleware,
  adminWriteLimiter,
  getAllPermissionsHandler,
);
permissionRouter.get(
  "/:userId",
  authMiddleware,
  adminWriteLimiter,
  getUserPermissionsHandler,
);

export { permissionRouter };
