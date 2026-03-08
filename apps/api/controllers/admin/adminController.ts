import { handleRequest } from "~/controllers/base/baseController";
import * as adminService from "~/services/admin/adminService";
import * as profileService from "~/services/profile/profileService";
import createLogger from "~/utils/createLogger";

const logger = createLogger("AdminController");

export const getUserHandler = handleRequest(async (req) => {
  const userId = req.params.id;
  const user = await profileService.getUser(userId);
  logger.info(`Fetched user with ID: ${userId}`);
  return user;
});

export const getUsersHandler = handleRequest(async (req) => {
  const { page = 1, limit = 10, search, role, sortBy, sortOrder } = req.query;

  const users = await adminService.getUsers({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    role: role as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as "asc" | "desc",
  });

  logger.info(`Fetched ${users.data.length} users (page ${page})`);
  return users;
});

export const deleteUsersHandler = handleRequest(async () => {
  await adminService.deleteUsers();
  logger.info("Deleted all users");
  return null;
});

export const deleteUserHandler = handleRequest(async (req) => {
  const userId = req.params.id;
  await profileService.deleteUser(userId);
  logger.info(`Deleted user with ID: ${userId}`);
  return null;
});

export const updateProfileHandler = handleRequest(async (req) => {
  const { email, password } = req.body;
  const userId = req.params.id;

  const updatedUser = await profileService.updateProfile({
    userId,
    email,
    password,
  });

  logger.info(`Admin updated profile for user with ID: ${userId}`);
  return updatedUser;
});
