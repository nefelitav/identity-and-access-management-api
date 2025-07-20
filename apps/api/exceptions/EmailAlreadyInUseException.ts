import { createException } from "~/utils/createException";
import { ResponseCode } from "~/utils";

export const EmailAlreadyInUseException = (email: string) =>
  createException(
    "EmailAlreadyInUseException",
    `Email ${email} already in use.`,
    ResponseCode.CONFLICT,
  );
