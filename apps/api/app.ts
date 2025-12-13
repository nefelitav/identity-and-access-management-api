import "module-alias/register";
import express from "express";
import dotenv from "dotenv";
import {
  adminRouter,
  authRouter,
  sessionRouter,
  profileRouter,
  captchaRouter,
  totpRouter,
  otpRouter,
  permissionRouter,
  rbacRouter,
  healthRouter,
} from "~/routes";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/sessions", sessionRouter);
app.use("/captcha", captchaRouter);
app.use("/mfa/totp", totpRouter);
app.use("/mfa/otp", otpRouter);
app.use("/permissions", permissionRouter);
app.use("/roles", rbacRouter);
app.use("/", healthRouter);

export default app;
