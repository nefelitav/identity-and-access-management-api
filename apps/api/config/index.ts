import { cleanEnv, str, num, url, makeValidator } from "envalid";

// Custom validator for strings with a minimum length
const minLengthString = (min: number) =>
  makeValidator<string>((input) => {
    if (input.length < min) {
      throw new Error(`Must be at least ${min} characters`);
    }
    return input;
  });

export const config = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"],
    default: "development",
  }),
  PORT: num({ default: 3000 }),

  // Database
  DATABASE_URL: url(),

  // JWT
  JWT_SECRET: minLengthString(32)(),
  JWT_EXPIRY: num({ default: 1 }),

  // Redis
  REDIS_URL: url({ default: "redis://localhost:6379" }),

  // Email
  SMTP_HOST: str({ default: "localhost" }),
  SMTP_PORT: num({ default: 587 }),
  SMTP_USER: str({ default: "" }),
  SMTP_PASS: str({ default: "" }),
  SMTP_FROM: str({ default: "noreply@example.com" }),

  // SMS
  TWILIO_ACCOUNT_SID: str({ default: "" }),
  TWILIO_AUTH_TOKEN: str({ default: "" }),
  TWILIO_PHONE_NUMBER: str({ default: "" }),

  // Captcha
  RECAPTCHA_SECRET_KEY: str({ default: "" }),
  RECAPTCHA_SITE_KEY: str({ default: "" }),

  // Security
  CORS_ORIGIN: str({ default: "http://localhost:3000" }),
  RATE_LIMIT_WINDOW_MS: num({ default: 15 * 60 * 1000 }), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),

  // Session
  SESSION_SECRET: minLengthString(32)(),
});

export type Config = typeof config;
