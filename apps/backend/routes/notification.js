import { Router } from 'express';
import { getUserOrGarageNotification, sendNotificationManually } from '../controller/notification.controller.js';
var router = Router();

router.post('/', sendNotificationManually)

router.get('/', getUserOrGarageNotification);

export default router;
