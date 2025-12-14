import { Request } from "express";

interface GrantPermissionRequestBody {
  userId: string;
  permission: string;
}

export type GrantPermissionRequest = Request<
  {},
  {},
  GrantPermissionRequestBody
>;

interface RevokePermissionRequestBody {
  userId: string;
  permission: string;
}

export type RevokePermissionRequest = Request<
  {},
  {},
  RevokePermissionRequestBody
>;

interface AddPermissionRequestBody {
  name: string;
}
export type AddPermissionRequest = Request<{}, {}, AddPermissionRequestBody>;

interface DeletePermissionRequestBody {
  name: string;
}
export type DeletePermissionRequest = Request<
  {},
  {},
  DeletePermissionRequestBody
>;

interface AssignRoleRequestBody {
  userId: string;
  role: string;
}
export type AssignRoleRequest = Request<{}, {}, AssignRoleRequestBody>;

interface RemoveRoleRequestBody {
  userId: string;
  role: string;
}
export type RemoveRoleRequest = Request<{}, {}, RemoveRoleRequestBody>;

interface CreateRoleRequestBody {
  name: string;
}
export type CreateRoleRequest = Request<{}, {}, CreateRoleRequestBody>;
