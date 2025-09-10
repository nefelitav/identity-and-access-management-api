import { Router } from "express";
import { RbacController } from "~/controllers";
import { adminWriteLimiter } from "~/utils";
import { authMiddleware } from "~/middleware";

const rbacRouter = Router();

rbacRouter.post(
  "/assign",
  authMiddleware,
  adminWriteLimiter,
  RbacController.assignRole,
);
rbacRouter.delete(
  "/remove",
  authMiddleware,
  adminWriteLimiter,
  RbacController.removeRole,
);
rbacRouter.get(
  "/:userId",
  authMiddleware,
  adminWriteLimiter,
  RbacController.getRoles,
);
rbacRouter.get(
  "/",
  authMiddleware,
  adminWriteLimiter,
  RbacController.getAllRoles,
);
rbacRouter.delete(
  "/delete",
  authMiddleware,
  adminWriteLimiter,
  RbacController.deleteRole,
);
rbacRouter.post(
  "/add",
  authMiddleware,
  adminWriteLimiter,
  RbacController.createRole,
);

export default rbacRouter;
