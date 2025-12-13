import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max requests
  message: {
    success: false,
    error: { message: "Too many login attempts, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 registrations per IP per hour
  message: {
    success: false,
    error: {
      message:
        "Too many registration attempts from this IP, please try again later.",
    },
  },
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    error: {
      message: "Too many token refresh attempts, please try again later.",
    },
  },
});

export const logoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: { message: "Too many logout attempts, please try again later." },
  },
});

export const captchaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // max 10 requests per window per IP
  message: {
    success: false,
    error: { message: "Too many CAPTCHA attempts, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 OTP requests per IP per hour
  message: {
    success: false,
    error: { message: "Too many OTP requests, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 verification attempts per IP
  message: {
    success: false,
    error: {
      message: "Too many OTP verification attempts, please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const totpSetupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 setup attempts
  message: {
    success: false,
    error: { message: "Too many TOTP setup attempts." },
  },
});

export const totpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 verification attempts
  message: {
    success: false,
    error: { message: "Too many TOTP verification attempts." },
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: { message: "Too many password reset requests." },
  },
});

export const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: { message: "Too many requests, try again later." },
  },
});

export const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: { message: "Too many session requests, try again later." },
  },
});
