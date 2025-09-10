import { Router } from "express";
import { PermissionController } from "~/controllers";
import { adminWriteLimiter } from "~/utils";

const permissionRouter = Router();

permissionRouter.get("/check", adminWriteLimiter, PermissionController.check);
permissionRouter.post("/grant", adminWriteLimiter, PermissionController.grant);
permissionRouter.post(
  "/revoke",
  adminWriteLimiter,
  PermissionController.revoke,
);
permissionRouter.post(
  "/add",
  adminWriteLimiter,
  PermissionController.addPermission,
);
permissionRouter.delete(
  "/delete",
  adminWriteLimiter,
  PermissionController.deletePermission,
);
permissionRouter.get(
  "/",
  adminWriteLimiter,
  PermissionController.getAllPermissions,
);
permissionRouter.get(
  "/:userId",
  adminWriteLimiter,
  PermissionController.getUserPermissions,
);

export default permissionRouter;
