import { Request } from "express";
import { UpdateProfileRequestBody } from "~/dtos";

interface UpdateProfileRequestParams {
  id: string;
}

export type UpdateProfileAdminRequest = Request<
  UpdateProfileRequestParams,
  {},
  UpdateProfileRequestBody
>;

interface GetUserRequestParams {
  id: string;
}

export type GetUserRequest = Request<GetUserRequestParams>;

interface DeleteUserRequestParams {
  id: string;
}

export type DeleteUserRequest = Request<DeleteUserRequestParams>;
