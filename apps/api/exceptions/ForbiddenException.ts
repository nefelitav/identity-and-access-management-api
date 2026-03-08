import { createException } from "~/utils/createException";
import { ResponseCode } from "~/utils";

export const ForbiddenException = (
  message = "Forbidden: insufficient permissions",
) => createException("ForbiddenException", message, ResponseCode.FORBIDDEN);
