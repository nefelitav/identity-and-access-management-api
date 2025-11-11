import express from "express";
import { AdminController } from "~/controllers";
import { authMiddleware } from "~/middleware";
import { validateRequest } from "~/middleware";
import {
  getUserSchema,
  getUsersSchema,
  deleteUserSchema,
  adminUpdateProfileSchema,
} from "~/validation/schemas";
import { adminWriteLimiter } from "~/utils";

const adminRouter = express.Router();

adminRouter.use(authMiddleware);

adminRouter.get(
  "/users",
  validateRequest(getUsersSchema),
  AdminController.getUsers,
);

adminRouter.get(
  "/users/:id",
  validateRequest(getUserSchema),
  AdminController.getUser,
);

adminRouter.put(
  "/users/:id",
  validateRequest(adminUpdateProfileSchema),
  adminWriteLimiter,
  AdminController.updateProfile,
);

adminRouter.delete(
  "/users/:id",
  validateRequest(deleteUserSchema),
  adminWriteLimiter,
  AdminController.deleteUser,
);

adminRouter.delete("/users", adminWriteLimiter, AdminController.deleteUsers);

export default adminRouter;
