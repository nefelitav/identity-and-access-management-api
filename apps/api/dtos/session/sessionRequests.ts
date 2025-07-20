import { Request } from "express";

export interface ListSessionsRequestBody {
  user: { id: string };
}

export interface DeleteSessionRequestBody {
  params: {
    sessionId: string;
  };
  user: { id: string };
}
export interface DeleteAllSessionsRequestBody {
  user: { id: string };
  sessionId: string;
}

export type ListSessionsRequest = Request<{}, {}, ListSessionsRequestBody>;
export type DeleteSessionRequest = Request<{}, {}, DeleteSessionRequestBody>;
export type DeleteAllSessionsRequest = Request<
  {},
  {},
  DeleteAllSessionsRequestBody
>;
