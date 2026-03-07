import { RbacRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

function getRbacRepository() {
  return container.get<RbacRepository>(SERVICE_IDENTIFIERS.RbacRepository);
}

/** Assign a named role to a user. */
export async function assignRoleToUser(userId: string, role: string) {
  return getRbacRepository().assignRoleToUser(userId, role);
}

/** Remove a named role from a user. */
export async function removeRoleFromUser(userId: string, role: string) {
  return getRbacRepository().removeRoleFromUser(userId, role);
}

/** Get all role names for a user. */
export async function getUserRoles(userId: string) {
  const userRoles = await getRbacRepository().getUserRoles(userId);
  return userRoles.map((ur: any) => ur.role.name);
}

/** Get all roles in the system (paginated). */
export async function getAllRoles() {
  return getRbacRepository().getAllRoles();
}

/** Create a new role. */
export async function createRole(name: string) {
  return getRbacRepository().createRole(name);
}

/** Delete an existing role by name. */
export async function deleteRole(name: string) {
  return getRbacRepository().deleteRole(name);
}
