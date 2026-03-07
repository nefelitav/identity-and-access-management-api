import {
  handleRequest,
  extractUserAgent,
  extractIpAddress,
} from "~/controllers/base/baseController";
import * as profileService from "~/services/profile/profileService";
import { createLogger } from "~/utils";

const logger = createLogger("ProfileController");

/** Update the authenticated user's profile (email / password). */
export const updateProfileHandler = handleRequest(async (req) => {
  const { email, password } = req.body;
  const userId = req.user?.userId;
  const userAgent = extractUserAgent(req);
  const ip = extractIpAddress(req);

  const updatedUser = await profileService.updateProfile({
    userId,
    email,
    password,
    userAgent,
    ip,
  });

  logger.info(`User profile updated successfully: ${email}`);
  return updatedUser;
});

/** Delete the authenticated user's account. */
export const deleteUserHandler = handleRequest(async (req) => {
  const userId = req.user?.userId;
  await profileService.deleteUser(userId);

  logger.info(`Deleted user: ${userId}`);
  return { message: "User deleted" };
});

/** Request a password-reset email. */
export const requestPasswordResetHandler = handleRequest(async (req) => {
  const { email } = req.body;
  await profileService.requestPasswordReset(email);

  logger.info(`Password reset requested for: ${email}`);
  return { message: "Password reset request sent" };
});

/** Reset password using a valid reset token. */
export const resetPasswordHandler = handleRequest(async (req) => {
  const { resetToken, newPassword } = req.body;
  await profileService.resetPassword(resetToken, newPassword);

  logger.info(`Password reset completed using token: ${resetToken}`);
  return { message: "Password reset successfully" };
});

/** Fetch the authenticated user's profile. */
export const getUserHandler = handleRequest(async (req) => {
  const userId = req.user?.userId;
  const user = await profileService.getUser(userId);

  logger.info(`Fetched user details for: ${userId}`);
  return user;
});
