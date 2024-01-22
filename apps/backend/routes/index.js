import { Router } from 'express';
import usersRouter from './users.js';
import garageRouter from './garage.js';
var router = Router();

router.use('/users', usersRouter);
router.use('/garage', garageRouter);

export default router;
