import { ApiResponse } from '~/dtos';

export type DeletePermissionResponse = ApiResponse<null>;
export type AddPermissionResponse = ApiResponse<null>;
export interface PermissionDTO {
    id: string;
    name: string;
}

export interface GetAllPermissionsResponseData {
    permissions: PermissionDTO[];
}

export type GetAllPermissionsResponse = ApiResponse<GetAllPermissionsResponseData>;

export interface GetUserPermissionsResponseData {
    permissions: PermissionDTO[];
}

export type GetUserPermissionsResponse = ApiResponse<GetUserPermissionsResponseData>;

export type RevokePermissionResponse = ApiResponse<null>;
export type GrantPermissionResponse = ApiResponse<null>;
type CheckPermissionResponseData = {
    allowed: boolean;
};
export type CheckPermissionResponse = ApiResponse<CheckPermissionResponseData>;

export type AssignRoleResponse = ApiResponse<null>;

export type RemoveRoleResponse = ApiResponse<null>;

export interface GetRolesResponseData {
    roles: string[];
}
export type GetRolesResponse = ApiResponse<GetRolesResponseData>;

export type DeleteRoleResponse = ApiResponse<null>;

export interface RoleDTO {
    id: string;
    name: string;
}

export interface GetAllRolesResponseData {
    roles: RoleDTO[];
}

export type GetAllRolesResponse = ApiResponse<GetAllRolesResponseData>;

export interface CreateRoleResponseData {
    role: RoleDTO;
}

export type CreateRoleResponse = ApiResponse<CreateRoleResponseData>;