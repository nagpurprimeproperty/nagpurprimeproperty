// staticPage.routes.js
import express from 'express';
import staticPageController from './staticPage.controller.js';

const router = express.Router();

router.get('/:slug', staticPageController.getPage);

export default router;