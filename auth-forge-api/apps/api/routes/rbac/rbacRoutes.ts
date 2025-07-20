import { Router } from 'express';
import { RbacController } from '~/controllers';

const rbacRouter = Router();

rbacRouter.post('/assign', RbacController.assignRole);
rbacRouter.delete('/remove', RbacController.removeRole);
rbacRouter.get('/:userId', RbacController.getRoles);
rbacRouter.get('/', RbacController.getAllRoles);
rbacRouter.delete('/delete', RbacController.deleteRole);
rbacRouter.post('/add', RbacController.createRole);

export default rbacRouter;
