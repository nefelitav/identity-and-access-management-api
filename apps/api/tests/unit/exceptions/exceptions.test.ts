import { EmailAlreadyInUseException } from "~/exceptions/EmailAlreadyInUseException";
import { InvalidCredentialsException } from "~/exceptions/InvalidCredentialsException";
import { UserNotFoundException } from "~/exceptions/UserNotFoundException";
import { AccountLockedException } from "~/exceptions/AccountLockedException";
import { InvalidRefreshTokenException } from "~/exceptions/InvalidRefreshTokenException";
import { CaptchaVerificationFailedException } from "~/exceptions/CaptchaVerificationFailedException";
import { InvalidOtpTokenException } from "~/exceptions/InvalidOtpTokenException";
import { InvalidTotpTokenException } from "~/exceptions/InvalidTotpTokenException";

describe("Custom Exceptions", () => {
  it("EmailAlreadyInUseException should have 409 status", () => {
    const err = EmailAlreadyInUseException("foo@bar.com");
    expect(err.statusCode).toBe(409);
    expect(err.name).toBe("EmailAlreadyInUseException");
    expect(err.message).toContain("foo@bar.com");
  });

  it("InvalidCredentialsException should have 401 status", () => {
    const err = InvalidCredentialsException();
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe("InvalidCredentialsException");
  });

  it("UserNotFoundException should have 404 status", () => {
    const err = UserNotFoundException();
    expect(err.statusCode).toBe(404);
    expect(err.name).toBe("UserNotFoundException");
  });

  it("AccountLockedException should have 403 status and include lockout time", () => {
    const lockout = new Date("2025-12-31T23:59:59Z");
    const err = AccountLockedException(lockout);
    expect(err.statusCode).toBe(403);
    expect(err.name).toBe("AccountLockedException");
    expect(err.message).toContain("locked");
  });

  it("InvalidRefreshTokenException should have 401 status", () => {
    const err = InvalidRefreshTokenException();
    expect(err.statusCode).toBe(401);
    expect(err.name).toBe("InvalidRefreshTokenException");
  });

  it("CaptchaVerificationFailedException should have 409 status", () => {
    const err = CaptchaVerificationFailedException();
    expect(err.statusCode).toBe(409);
    expect(err.name).toBe("CaptchaVerificationFailedException");
  });

  it("InvalidOtpTokenException should have 400 status", () => {
    const err = InvalidOtpTokenException();
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe("InvalidOtpTokenException");
  });

  it("InvalidTotpTokenException should have 400 status", () => {
    const err = InvalidTotpTokenException();
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe("InvalidTotpTokenException");
  });
});
