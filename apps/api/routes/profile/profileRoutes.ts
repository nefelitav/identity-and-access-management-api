import express from "express";
import {
  requestPasswordResetHandler,
  resetPasswordHandler,
  getUserHandler,
  updateProfileHandler,
  deleteUserHandler,
} from "~/controllers/profile/profileController";
import { authMiddleware, validateRequest } from "~/middleware";
import { updateProfileSchema } from "~/validation/schemas";
import { passwordResetLimiter } from "~/utils";

const profileRouter = express.Router();

profileRouter.post(
  "/request-password-reset",
  passwordResetLimiter,
  requestPasswordResetHandler,
);
profileRouter.post(
  "/password-reset",
  passwordResetLimiter,
  resetPasswordHandler,
);

profileRouter.get("/", authMiddleware, getUserHandler);
profileRouter.put(
  "/",
  authMiddleware,
  validateRequest(updateProfileSchema),
  updateProfileHandler,
);
profileRouter.delete("/", authMiddleware, deleteUserHandler);

export { profileRouter };
