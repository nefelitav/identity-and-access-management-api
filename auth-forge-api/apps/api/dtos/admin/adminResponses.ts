import { ApiResponse } from '~/dtos';

type GetUserResponseData = {
    email: string;
};

type GetUsersResponseData = Array<GetUserResponseData>;

export type GetUsersResponse = ApiResponse<GetUsersResponseData>;
export type GetUserResponse = ApiResponse<GetUserResponseData>;
export type DeleteUserResponse = ApiResponse<null>;
export type DeleteUsersResponse = ApiResponse<null>;
