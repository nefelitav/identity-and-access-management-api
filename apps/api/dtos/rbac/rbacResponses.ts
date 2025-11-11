import { ApiResponse } from "~/dtos";

export type DeletePermissionResponse = ApiResponse<null>;
export type AddPermissionResponse = ApiResponse<null>;
interface PermissionDTO {
  id: string;
  name: string;
}

interface GetAllPermissionsResponseData {
  permissions: PermissionDTO[];
}

export type GetAllPermissionsResponse =
  ApiResponse<GetAllPermissionsResponseData>;

interface GetUserPermissionsResponseData {
  permissions: PermissionDTO[];
}

export type GetUserPermissionsResponse =
  ApiResponse<GetUserPermissionsResponseData>;

export type RevokePermissionResponse = ApiResponse<null>;
export type GrantPermissionResponse = ApiResponse<null>;
type CheckPermissionResponseData = {
  allowed: boolean;
};
export type CheckPermissionResponse = ApiResponse<CheckPermissionResponseData>;

export type AssignRoleResponse = ApiResponse<null>;

export type RemoveRoleResponse = ApiResponse<null>;

interface GetRolesResponseData {
  roles: string[];
}
export type GetRolesResponse = ApiResponse<GetRolesResponseData>;

export type DeleteRoleResponse = ApiResponse<null>;

interface RoleDTO {
  id: string;
  name: string;
}

interface GetAllRolesResponseData {
  roles: RoleDTO[];
}

export type GetAllRolesResponse = ApiResponse<GetAllRolesResponseData>;

interface CreateRoleResponseData {
  role: RoleDTO;
}

export type CreateRoleResponse = ApiResponse<CreateRoleResponseData>;
