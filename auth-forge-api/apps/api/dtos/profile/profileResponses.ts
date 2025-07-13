import { ApiResponse } from '~/dtos';

interface UpdateProfileResponseData {
    id: string;
    email: string;
    updatedAt: string;
    accessToken: string;
    refreshToken: string;
}

interface GetProfileResponseData {
    id: string;
    email: string;
}

export type UpdateProfileResponse = ApiResponse<UpdateProfileResponseData>;
export type GetAccountResponse = ApiResponse<GetProfileResponseData>;
export type ResetPasswordResponse = ApiResponse<null>;
export type RequestPasswordResetResponse = ApiResponse<null>;
