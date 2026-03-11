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
import { passwordResetLimiter, profileLimiter } from "~/utils";

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

profileRouter.get("/", profileLimiter, authMiddleware, getUserHandler);
profileRouter.put(
  "/",
  profileLimiter,
  authMiddleware,
  validateRequest(updateProfileSchema),
  updateProfileHandler,
);
profileRouter.delete("/", profileLimiter, authMiddleware, deleteUserHandler);

export { profileRouter };
