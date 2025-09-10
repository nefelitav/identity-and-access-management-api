import { createException } from "~/utils/createException";
import { ResponseCode } from "~/utils";

export const AccountLockedException = (lockoutUntil: Date) =>
  createException(
    "AccountLockedException",
    `Account locked until ${lockoutUntil.toLocaleString()} due to multiple failed login attempts.`,
    ResponseCode.FORBIDDEN,
  );
