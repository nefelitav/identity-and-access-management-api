import { Router } from "express";
import { TotpController } from "~/controllers";
import { totpSetupLimiter, totpVerifyLimiter } from "~/utils";

const totpRouter = Router();

totpRouter.post("/enable", totpSetupLimiter, TotpController.enable);
totpRouter.post("/confirm", totpSetupLimiter, TotpController.confirmAndEnable);
totpRouter.post("/verify", totpVerifyLimiter, TotpController.verify);
totpRouter.post("/disable", totpSetupLimiter, TotpController.disable);

export default totpRouter;
