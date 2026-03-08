import { createException } from "~/utils/createException";
import { ResponseCode } from "~/utils";

export const MfaChallengeRequiredException = () =>
  createException(
    "MfaChallengeRequiredException",
    "MFA verification required to complete login",
    ResponseCode.FORBIDDEN,
  );
