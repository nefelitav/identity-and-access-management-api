import express from "express";
import {
  requestPasswordResetHandler,
  resetPasswordHandler,
  getUserHandler,
  updateProfileHandler,
  deleteUserHandler,
} from "~/controllers/profile/profileController";
import { authMiddleware } from "~/middleware";
import { passwordResetLimiter } from "~/utils";

const profileRouter = express.Router();

profileRouter.post(
  "/request-password-reset",
  authMiddleware,
  passwordResetLimiter,
  requestPasswordResetHandler,
);
profileRouter.post(
  "/password-reset",
  authMiddleware,
  passwordResetLimiter,
  resetPasswordHandler,
);
profileRouter.get("/", authMiddleware, getUserHandler);
profileRouter.put("/", authMiddleware, updateProfileHandler);
profileRouter.delete("/", authMiddleware, deleteUserHandler);

export { profileRouter };
