import { Router } from "express";
import { TotpController } from "~/controllers";

const totpRouter = Router();

totpRouter.post("/enable", TotpController.enable);
totpRouter.post("/confirm", TotpController.confirmAndEnable);
totpRouter.post("/verify", TotpController.verify);
totpRouter.post("/disable", TotpController.disable);

export default totpRouter;
