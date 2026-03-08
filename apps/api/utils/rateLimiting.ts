import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many login attempts, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: () => isTest,
  message: {
    success: false,
    error: {
      message:
        "Too many registration attempts from this IP, please try again later.",
    },
  },
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  skip: () => isTest,
  message: {
    success: false,
    error: {
      message: "Too many token refresh attempts, please try again later.",
    },
  },
});

export const logoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many logout attempts, please try again later." },
  },
});

export const captchaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many CAPTCHA attempts, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many OTP requests, please try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: () => isTest,
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
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many TOTP setup attempts." },
  },
});

export const totpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many TOTP verification attempts." },
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many password reset requests." },
  },
});

export const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many requests, try again later." },
  },
});

export const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  skip: () => isTest,
  message: {
    success: false,
    error: { message: "Too many session requests, try again later." },
  },
});
