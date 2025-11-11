import { Request } from "express";

interface ListSessionsRequestBody {
  user: { id: string };
}

interface DeleteSessionRequestBody {
  params: {
    sessionId: string;
  };
  user: { id: string };
}
interface DeleteAllSessionsRequestBody {
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
