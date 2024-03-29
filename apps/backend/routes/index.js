import { Router } from 'express';
import usersRouter from './users.js';
import garageRouter from './garage.js';
import categoryRouter from './category.js';
import brandRouter from './brand.js';
import paymentRouter from './payment.js';
import orderRouter from './order.js';
import notificationRouter from './notification.js';
import garageManagementRouter from './garageManagement.js';
import roomRouter from './room.js'
var router = Router();

router.use('/users', usersRouter);
router.use('/garage', garageRouter);
router.use('/category', categoryRouter);
router.use('/brands', brandRouter);
router.use('/payment', paymentRouter);
router.use('/order', orderRouter);
router.use('/notification', notificationRouter);
router.use('/garageManagement', garageManagementRouter);
router.use('/room', roomRouter)

export default router;
