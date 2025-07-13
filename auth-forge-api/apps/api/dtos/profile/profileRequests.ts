import { Request } from 'express';

export interface UpdateProfileRequestBody {
    email: string;
    password: string;
}

interface ResetPasswordBody {
    resetToken: string;
    newPassword: string;
}

interface RequestPasswordResetRequestBody {
    email: string;
}

export type UpdateProfileRequest = Request<{}, {}, UpdateProfileRequestBody>;
export type RequestPasswordResetRequest = Request<{}, {}, RequestPasswordResetRequestBody>;
export type ResetPasswordRequest = Request<{}, {}, ResetPasswordBody>;
