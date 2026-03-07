import express from "express";
import {
  getUserHandler,
  getUsersHandler,
  deleteUserHandler,
  deleteUsersHandler,
  updateProfileHandler,
} from "~/controllers/admin/adminController";
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

adminRouter.get("/users", validateRequest(getUsersSchema), getUsersHandler);

adminRouter.get("/users/:id", validateRequest(getUserSchema), getUserHandler);

adminRouter.put(
  "/users/:id",
  validateRequest(adminUpdateProfileSchema),
  adminWriteLimiter,
  updateProfileHandler,
);

adminRouter.delete(
  "/users/:id",
  validateRequest(deleteUserSchema),
  adminWriteLimiter,
  deleteUserHandler,
);

adminRouter.delete("/users", adminWriteLimiter, deleteUsersHandler);

export { adminRouter };
