import { container, SERVICE_IDENTIFIERS } from "~/core";
import { PermissionsRepository } from "~/repositories/rbac";

function getPermissionsRepository() {
  return container.get<PermissionsRepository>(
    SERVICE_IDENTIFIERS.PermissionRepository,
  );
}

/** Check whether a user has a specific permission. */
export async function checkPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  return getPermissionsRepository().hasPermission(userId, permission);
}

/** Grant a permission to a role. */
export async function grantPermission(roleId: string, permission: string) {
  return getPermissionsRepository().grantPermissionToRole(roleId, permission);
}

/** Revoke a permission from a role. */
export async function revokePermissionFromRole(
  roleId: string,
  permission: string,
) {
  return getPermissionsRepository().revokePermissionFromRole(
    roleId,
    permission,
  );
}

/** Get all permissions in the system. */
export async function getAllPermissions() {
  return getPermissionsRepository().getAllPermissions();
}

/** Get all permissions assigned to a user through their roles. */
export async function getUserPermissions(userId: string) {
  return getPermissionsRepository().getUserPermissions(userId);
}

/** Add a new permission to the system. */
export async function addPermission(name: string) {
  return getPermissionsRepository().createPermission(name);
}

/** Delete a permission by name. */
export async function deletePermission(name: string) {
  return getPermissionsRepository().deletePermission(name);
}
