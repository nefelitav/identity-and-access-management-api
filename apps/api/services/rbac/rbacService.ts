import { RbacRepository } from "~/repositories";
import { container, SERVICE_IDENTIFIERS } from "~/core";

function getRbacRepository() {
  return container.get<RbacRepository>(SERVICE_IDENTIFIERS.RbacRepository);
}

export async function assignRoleToUser(userId: string, role: string) {
  return getRbacRepository().assignRoleToUser(userId, role);
}

export async function removeRoleFromUser(userId: string, role: string) {
  return getRbacRepository().removeRoleFromUser(userId, role);
}

export async function getUserRoles(userId: string) {
  const userRoles = await getRbacRepository().getUserRoles(userId);
  return userRoles.map((ur: any) => ur.role.name);
}

export async function getAllRoles() {
  return getRbacRepository().getAllRoles();
}

export async function createRole(name: string) {
  return getRbacRepository().createRole(name);
}

export async function deleteRole(name: string) {
  return getRbacRepository().deleteRole(name);
}
