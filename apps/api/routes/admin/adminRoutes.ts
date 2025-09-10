import express from "express";
import { AdminController } from "~/controllers";
import { authMiddleware } from "~/middleware";

const adminRouter = express.Router();

adminRouter.get("/admin/users", authMiddleware, AdminController.getUsers);
adminRouter.get("/admin/users/:id", authMiddleware, AdminController.getUser);
adminRouter.delete("/admin/users", authMiddleware, AdminController.deleteUsers);
adminRouter.delete(
  "/admin/users/:id",
  authMiddleware,
  AdminController.deleteUser,
);
adminRouter.patch(
  "/admin/users/:id",
  authMiddleware,
  AdminController.updateProfile,
);

export default adminRouter;
