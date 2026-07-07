import {Router} from 'express';
import {listLeads,updateLeadStatus,getLeadById} from './lead.controller.js';
import {userProtect} from '../../middlewares/auth.middleware.js';
import {updateLeadStatusSchema} from './lead.schema.js';
import validate from '../../middlewares/validate.middleware.js';
const router = Router();

router.use(userProtect); // Protect all routes below with authentication middleware
router.get('/', listLeads);
router.get('/:id', getLeadById);
router.patch('/:id/update-status', validate(updateLeadStatusSchema), updateLeadStatus);


export default router;