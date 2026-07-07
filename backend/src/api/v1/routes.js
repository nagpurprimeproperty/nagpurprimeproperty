import { Router } from 'express';
import  propertyRoutes from '../../modules/property/property.routes.js';
import mediaRoutes from '../../modules/media/media.routes.js';
import userRoutes from '../../modules/user/user.routes.js';
import notificationRoutes from '../../modules/notification/notification.routes.js';
import  leads from '../../modules/lead/lead.routes.js';
import enquiryRoutes from '../../modules/enquiry/enquiry.routes.js';
import staticPageRoutes from '../../modules/static-page/staticPage.routes.js';
import purchasePlanRoutes from '../../modules/subscription/plans.routes.js';
import subscriptionRoutes from '../../modules/subscription/plan.routes.js';
import mapsRoutes from '../../modules/maps/maps.routes.js';
import keywordRoutes from '../../modules/keyword/keyword.routes.js';

const router = Router();

router.use('/', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/media', mediaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/static-pages', staticPageRoutes);
router.use('/leads', leads);
router.use('/enquiries', enquiryRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/subscriptions/purchase', purchasePlanRoutes);
// Maps proxy — key lives here on the server, never in the JS bundle
router.use('/maps', mapsRoutes);
// SEO Keywords
router.use('/keywords', keywordRoutes);

export default router;