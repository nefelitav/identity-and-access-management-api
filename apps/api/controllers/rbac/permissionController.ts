import { handleRequest } from "~/controllers/base/baseController";
import * as permissionService from "~/services/rbac/permissionService";
import { createLogger } from "~/utils";

const logger = createLogger("PermissionController");

export const checkHandler = handleRequest(async (req) => {
  const { userId, permission } = req.query;
  const allowed = await permissionService.checkPermission(
    userId as string,
    permission as string,
  );

  logger.info(
    `Checked permission "${permission}" for user: ${userId}. Allowed: ${allowed}`,
  );
  return { allowed };
});

export const grantHandler = handleRequest(async (req) => {
  const { userId, permission } = req.body;
  await permissionService.grantPermission(userId, permission);

  logger.info(`Granted permission "${permission}" to user: ${userId}`);
  return { message: "Permission granted" };
});

export const revokeHandler = handleRequest(async (req) => {
  const { userId, permission } = req.body;
  await permissionService.revokePermissionFromRole(userId, permission);

  logger.info(`Revoked permission "${permission}" from user: ${userId}`);
  return { message: "Permission revoked" };
});

export const getAllPermissionsHandler = handleRequest(async () => {
  const permissions = await permissionService.getAllPermissions();

  logger.info(`Fetched all permissions. Count: ${permissions.length}`);
  return { permissions };
});

export const getUserPermissionsHandler = handleRequest(async (req) => {
  const { userId } = req.params;
  const userPermissions = await permissionService.getUserPermissions(userId);
  const permissions = userPermissions.flatMap((role: any) =>
    role.rolePermissions.map((rp: any) => rp.permission),
  );

  logger.info(
    `Fetched permissions for user: ${userId}. Count: ${permissions.length}`,
  );
  return { permissions };
});

export const addPermissionHandler = handleRequest(async (req) => {
  const { name } = req.body;
  await permissionService.addPermission(name);

  logger.info(`Added new permission: "${name}"`);
  return { message: "Permission added" };
});

export const deletePermissionHandler = handleRequest(async (req) => {
  const { name } = req.body;
  await permissionService.deletePermission(name);

  logger.info(`Deleted permission: "${name}"`);
  return { message: "Permission deleted" };
});
