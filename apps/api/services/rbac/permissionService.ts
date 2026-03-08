import { container, SERVICE_IDENTIFIERS } from "~/core";
import { PermissionsRepository } from "~/repositories/rbac";

function getPermissionsRepository() {
  return container.get<PermissionsRepository>(
    SERVICE_IDENTIFIERS.PermissionRepository,
  );
}

export async function checkPermission(
  userId: string,
  permission: string,
): Promise<boolean> {
  return getPermissionsRepository().hasPermission(userId, permission);
}

export async function grantPermission(roleId: string, permission: string) {
  return getPermissionsRepository().grantPermissionToRole(roleId, permission);
}

export async function revokePermissionFromRole(
  roleId: string,
  permission: string,
) {
  return getPermissionsRepository().revokePermissionFromRole(
    roleId,
    permission,
  );
}

export async function getAllPermissions() {
  return getPermissionsRepository().getAllPermissions();
}

export async function getUserPermissions(userId: string) {
  return getPermissionsRepository().getUserPermissions(userId);
}

export async function addPermission(name: string) {
  return getPermissionsRepository().createPermission(name);
}

export async function deletePermission(name: string) {
  return getPermissionsRepository().deletePermission(name);
}
