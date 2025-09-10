import { Router } from "express";
import { PermissionController } from "~/controllers";
import { adminWriteLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const permissionRouter = Router();

permissionRouter.get(
  "/check",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.check,
);
permissionRouter.post(
  "/grant",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.grant,
);
permissionRouter.post(
  "/revoke",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.revoke,
);
permissionRouter.post(
  "/add",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.addPermission,
);
permissionRouter.delete(
  "/delete",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.deletePermission,
);
permissionRouter.get(
  "/",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.getAllPermissions,
);
permissionRouter.get(
  "/:userId",
  authMiddleware,
  adminWriteLimiter,
  PermissionController.getUserPermissions,
);

export default permissionRouter;
