import {
  handleRequest,
  extractUserAgent,
  extractIpAddress,
} from "~/controllers/base/baseController";
import * as adminService from "~/services/admin/adminService";
import * as profileService from "~/services/profile/profileService";
import createLogger from "~/utils/createLogger";

const logger = createLogger("AdminController");

/** Fetch a single user by ID. */
export const getUserHandler = handleRequest(async (req) => {
  const userId = req.params.id;
  const user = await profileService.getUser(userId);
  logger.info(`Fetched user with ID: ${userId}`);
  return user;
});

/** Fetch a paginated list of users with optional filtering and sorting. */
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

/** Delete all users from the system. */
export const deleteUsersHandler = handleRequest(async () => {
  await adminService.deleteUsers();
  logger.info("Deleted all users");
  return null;
});

/** Delete a single user by ID. */
export const deleteUserHandler = handleRequest(async (req) => {
  const userId = req.params.id;
  await profileService.deleteUser(userId);
  logger.info(`Deleted user with ID: ${userId}`);
  return null;
});

/** Admin-level profile update for a specific user. */
export const updateProfileHandler = handleRequest(async (req) => {
  const { email, password } = req.body;
  const userId = req.params.id;
  const userAgent = extractUserAgent(req);
  const ip = extractIpAddress(req);

  const updatedUser = await profileService.updateProfile({
    userId,
    email,
    password,
    userAgent,
    ip,
  });

  logger.info(`Admin updated profile for user with ID: ${userId}`);
  return updatedUser;
});
