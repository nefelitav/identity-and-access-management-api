import express from "express";
import { AdminController } from "~/controllers";

const adminRouter = express.Router();

adminRouter.get("/admin/users", AdminController.getUsers);
adminRouter.get("/admin/users/:id", AdminController.getUser);
adminRouter.delete("/admin/users", AdminController.deleteUsers);
adminRouter.delete("/admin/users/:id", AdminController.deleteUser);
adminRouter.patch("/admin/users/:id", AdminController.updateProfile);

export default adminRouter;
