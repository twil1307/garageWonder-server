import { Router } from 'express';
import usersRouter from './users.js';
import garageRouter from './garage.js';
import categoryRouter from './category.js';
import paymentRouter from './payment.js';
var router = Router();

router.use('/users', usersRouter);
router.use('/garage', garageRouter);
router.use('/category', categoryRouter);
router.use('/payment', paymentRouter);

export default router;
