import "module-alias/register";
import express from "express";
import dotenv from "dotenv";
import authRouter from "~/routes/auth";
import sessionRouter from "~/routes/session/sessionRoutes";
import profileRouter from "~/routes/profile/profileRoutes";
import adminRouter from "~/routes/admin/adminRoutes";
import captchaRouter from "~/routes/captcha/captchaRoutes";
import permissionRouter from "~/routes/rbac/permissionRoutes";
import rbacRouter from "~/routes/rbac/rbacRoutes";
import totpRouter from "~/routes/mfa/totpRoutes";
import otpRouter from "~/routes/mfa/otpRoutes";
import healthRouter from "~/routes/health/healthRoutes";

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
