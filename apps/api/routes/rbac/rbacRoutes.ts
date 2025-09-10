import { Router } from "express";
import { RbacController } from "~/controllers";
import { adminWriteLimiter } from "~/utils";

const rbacRouter = Router();

rbacRouter.post("/assign", adminWriteLimiter, RbacController.assignRole);
rbacRouter.delete("/remove", adminWriteLimiter, RbacController.removeRole);
rbacRouter.get("/:userId", adminWriteLimiter, RbacController.getRoles);
rbacRouter.get("/", adminWriteLimiter, RbacController.getAllRoles);
rbacRouter.delete("/delete", adminWriteLimiter, RbacController.deleteRole);
rbacRouter.post("/add", adminWriteLimiter, RbacController.createRole);

export default rbacRouter;
