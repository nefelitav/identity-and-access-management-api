import { Router } from "express";
import { PermissionController } from "~/controllers";

const permissionRouter = Router();

permissionRouter.get("/check", PermissionController.check);
permissionRouter.post("/grant", PermissionController.grant);
permissionRouter.post("/revoke", PermissionController.revoke);
permissionRouter.post("/add", PermissionController.addPermission);
permissionRouter.delete("/delete", PermissionController.deletePermission);
permissionRouter.get("/", PermissionController.getAllPermissions);
permissionRouter.get("/:userId", PermissionController.getUserPermissions);

export default permissionRouter;
