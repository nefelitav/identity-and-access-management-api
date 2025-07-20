import express from "express";
import { ProfileController } from "~/controllers/profile";
import { authMiddleware } from "~/middleware";

const profileRouter = express.Router();

profileRouter.post(
  "/request-password-reset",
  authMiddleware,
  ProfileController.requestPasswordReset,
);
profileRouter.post(
  "/password-reset",
  authMiddleware,
  ProfileController.resetPassword,
);
profileRouter.get("/", ProfileController.getUser);
profileRouter.put("/", ProfileController.updateProfile);
profileRouter.delete("/", ProfileController.deleteUser);
export default profileRouter;
