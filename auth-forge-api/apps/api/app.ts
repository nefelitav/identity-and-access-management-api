import express from 'express';
import dotenv from 'dotenv';
import profileRouter from '~/routes/profile/profileRoutes';
import adminRouter from "~/routes/admin/adminRoutes";

dotenv.config();
const app = express();

app.use(express.json());

app.use('/admin', adminRouter);
app.use('/profile', profileRouter);

export default app;
