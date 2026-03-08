import "module-alias/register";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import {
  adminRouter,
  authRouter,
  sessionRouter,
  profileRouter,
  totpRouter,
  otpRouter,
  permissionRouter,
  rbacRouter,
  healthRouter,
} from "~/routes";
import { errorHandler } from "~/middleware";

dotenv.config();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use((req, _res, next) => {
  const id = (req.headers["x-request-id"] as string) ?? crypto.randomUUID();
  req.headers["x-request-id"] = id;
  next();
});

app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/sessions", sessionRouter);
app.use("/mfa/totp", totpRouter);
app.use("/mfa/otp", otpRouter);
app.use("/permissions", permissionRouter);
app.use("/roles", rbacRouter);
app.use("/", healthRouter);

app.use(errorHandler);

export default app;
