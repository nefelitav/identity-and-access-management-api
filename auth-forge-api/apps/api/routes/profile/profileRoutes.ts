import express from 'express';
import { ProfileController } from '~/controllers/profile';

const profileRouter = express.Router();

profileRouter.post('/request-password-reset', ProfileController.requestPasswordReset);
profileRouter.post('/password-reset', ProfileController.resetPassword);
profileRouter.get('/', ProfileController.getUser);
profileRouter.put('/', ProfileController.updateProfile);
profileRouter.delete('/', ProfileController.deleteUser);
export default profileRouter;
