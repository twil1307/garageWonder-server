import { Router } from 'express';
import { createNewOrder } from '../controller/order.controller.js';
var router = Router();

router.post('/', createNewOrder);

export default router;
