import {Router} from 'express';
import { listEnquiries, getEnquiryById} from './enquiry.controller.js';
import {userProtect} from '../../middlewares/auth.middleware.js';
const router = Router();

router.use(userProtect);  
router.get('/', listEnquiries);
router.get('/:id', getEnquiryById);

export default router;