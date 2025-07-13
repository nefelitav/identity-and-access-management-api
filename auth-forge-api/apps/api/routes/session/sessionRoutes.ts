import { Router } from 'express';
import { SessionController } from '~/controllers';

const sessionRouter = Router();

sessionRouter.get('/', SessionController.listSessions);
sessionRouter.delete('/:sessionId', SessionController.deleteSession);
sessionRouter.delete('/', SessionController.deleteAllSessions);

export default sessionRouter;
