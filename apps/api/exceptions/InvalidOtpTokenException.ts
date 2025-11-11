import { createException, ResponseCode } from "~/utils";

export const InvalidOtpTokenException = () =>
  createException(
    "InvalidOtpTokenException",
    "The OTP token provided is invalid.",
    ResponseCode.BAD_REQUEST,
  );
