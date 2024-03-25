import { Router } from 'express';
import { getUserOrGarageNotification, markReadNoti, sendNotificationManually } from '../controller/notification.controller.js';
import { isLogin } from '../middleware/userAuthMiddleware.js';
var router = Router();

router.put('/read', isLogin(), markReadNoti);

router.post('/', sendNotificationManually)

router.get('/', getUserOrGarageNotification);

export default router;
