import express from "express";
import { ProfileController } from "~/controllers/profile";
import { authMiddleware } from "~/middleware";
import { passwordResetLimiter } from "~/utils";

const profileRouter = express.Router();

profileRouter.post(
  "/request-password-reset",
  authMiddleware,
  passwordResetLimiter,
  ProfileController.requestPasswordReset,
);
profileRouter.post(
  "/password-reset",
  authMiddleware,
  passwordResetLimiter,
  ProfileController.resetPassword,
);
profileRouter.get("/", authMiddleware, ProfileController.getUser);
profileRouter.put("/", authMiddleware, ProfileController.updateProfile);
profileRouter.delete("/", authMiddleware, ProfileController.deleteUser);
export default profileRouter;
