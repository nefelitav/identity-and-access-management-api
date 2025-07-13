import express from 'express';
import dotenv from 'dotenv';
import authRouter from '~/routes/auth/authRoutes';
import sessionRouter from '~/routes/session/sessionRoutes';
import profileRouter from '~/routes/profile/profileRoutes';
import adminRouter from "~/routes/admin/adminRoutes";
import captchaRouter from "~/routes/captcha/captchaRoutes";

dotenv.config();
const app = express();

app.use(express.json());

app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/sessions', sessionRouter);
app.use('/captcha', captchaRouter);

export default app;
