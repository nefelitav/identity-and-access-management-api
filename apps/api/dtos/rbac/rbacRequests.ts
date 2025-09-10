import { Request } from "express";

export interface CheckPermissionRequestQuery {
  userId: string;
  permission: string;
}
export type CheckPermissionRequest = Request<
  {},
  {},
  {},
  CheckPermissionRequestQuery
>;

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

interface GetUserPermissionsRequestParams {
  userId: string;
}
export type GetUserPermissionsRequest =
  Request<GetUserPermissionsRequestParams>;

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

export interface AssignRoleRequestBody {
  userId: string;
  role: string;
}
export type AssignRoleRequest = Request<{}, {}, AssignRoleRequestBody>;

export interface RemoveRoleRequestBody {
  userId: string;
  role: string;
}
export type RemoveRoleRequest = Request<{}, {}, RemoveRoleRequestBody>;

export interface GetRolesRequestParams {
  userId: string;
}
export type GetRolesRequest = Request<GetRolesRequestParams>;

export interface CreateRoleRequestBody {
  name: string;
}
export type CreateRoleRequest = Request<{}, {}, CreateRoleRequestBody>;

export interface DeleteRoleRequestParams {
  name: string;
}
export type DeleteRoleRequest = Request<DeleteRoleRequestParams>;
