import { createException } from "~/utils/createException";
import { ResponseCode } from "~/utils";

export const UserNotFoundException = () =>
  createException(
    "UserNotFoundException",
    `User not found.`,
    ResponseCode.NOT_FOUND,
  );
