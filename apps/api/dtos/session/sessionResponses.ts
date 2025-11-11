import { ApiResponse } from "~/dtos";

interface ListSessionsResponseData {
  id: string;
  userId: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
  lastActiveAt: string;
}
export type ListSessionsResponse = ApiResponse<Array<ListSessionsResponseData>>;
export type DeleteSessionResponse = ApiResponse<null>;
export type DeleteAllSessionsResponse = ApiResponse<null>;
