import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import createLogger from "~/utils/createLogger";

const logger = createLogger("ErrorHandler");

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

/**
 * Maps well-known exception names to machine-readable error codes.
 */
const ERROR_CODE_MAP: Record<string, string> = {
  EmailAlreadyInUseException: "AUTH_EMAIL_TAKEN",
  InvalidCredentialsException: "AUTH_INVALID_CREDENTIALS",
  AccountLockedException: "AUTH_ACCOUNT_LOCKED",
  InvalidRefreshTokenException: "AUTH_INVALID_REFRESH_TOKEN",
  ForbiddenException: "AUTH_FORBIDDEN",
  MfaChallengeRequiredException: "AUTH_MFA_REQUIRED",
  UserNotFoundException: "USER_NOT_FOUND",
  CaptchaVerificationFailedException: "CAPTCHA_FAILED",
  InvalidOtpTokenException: "MFA_INVALID_OTP",
  InvalidTotpTokenException: "MFA_INVALID_TOTP",
  UserMustHaveAtLeastOneRoleException: "RBAC_MIN_ONE_ROLE",
};

/**
 * Centralized Express error handler.
 * Must be registered AFTER all routes with `app.use(errorHandler)`.
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation Error",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      },
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const code =
    err.code ??
    ERROR_CODE_MAP[err.name] ??
    (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");

  // Log server errors fully; client errors at warn level
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} — ${err.message}`, err);
  } else {
    logger.warn(`${req.method} ${req.path} — ${statusCode} ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode >= 500 ? "Internal server error" : err.message,
    },
  });
}
