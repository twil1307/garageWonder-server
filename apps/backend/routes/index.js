import { Router } from 'express';
import usersRouter from './users.js';
import garageRouter from './garage.js';
import categoryRouter from './category.js';
var router = Router();

router.use('/users', usersRouter);
router.use('/garage', garageRouter);
router.use('/category', categoryRouter);

export default router;
