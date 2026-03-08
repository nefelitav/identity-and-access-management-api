import { handleRequest } from "~/controllers/base/baseController";
import * as rbacService from "~/services/rbac/rbacService";
import { createLogger } from "~/utils";

const logger = createLogger("RbacController");

/** Assign a role to a user. */
export const assignRoleHandler = handleRequest(async (req) => {
  const { userId, role } = req.body;
  await rbacService.assignRoleToUser(userId, role);

  logger.info(`Assigned role "${role}" to user: ${userId}`);
  return { message: "Role assigned" };
});

/** Remove a role from a user. */
export const removeRoleHandler = handleRequest(async (req) => {
  const { userId, role } = req.body;
  await rbacService.removeRoleFromUser(userId, role);

  logger.info(`Removed role "${role}" from user: ${userId}`);
  return { message: "Role removed" };
});

/** Get all roles assigned to a specific user. */
export const getRolesHandler = handleRequest(async (req) => {
  const { userId } = req.params;
  const roles = await rbacService.getUserRoles(userId);

  logger.info(`Fetched roles for user: ${userId}. Count: ${roles.length}`);
  return { roles };
});

/** Fetch all roles in the system. */
export const getAllRolesHandler = handleRequest(async () => {
  const roles = await rbacService.getAllRoles();

  logger.info(`Fetched all roles. Count: ${roles.data.length}`);
  return { roles };
});

/** Create a new role. */
export const createRoleHandler = handleRequest(async (req) => {
  const { name } = req.body;
  const role = await rbacService.createRole(name);

  logger.info(`Created new role: "${name}"`);
  return { role };
});

/** Delete an existing role by name. */
export const deleteRoleHandler = handleRequest(async (req) => {
  const { name } = req.body;
  await rbacService.deleteRole(name);

  logger.info(`Deleted role: "${name}"`);
  return { message: "Role deleted" };
});
