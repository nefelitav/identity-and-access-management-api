import { createException, ResponseCode } from "~/utils";

export const InvalidTotpTokenException = () =>
  createException(
    "InvalidTotpTokenException",
    "The TOTP token provided is invalid.",
    ResponseCode.BAD_REQUEST,
  );
