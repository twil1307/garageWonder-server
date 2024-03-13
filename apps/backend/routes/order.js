import { Router } from 'express';
import { createNewOrder, getGarageOrders } from '../controller/order.controller.js';
var router = Router();

router.get('/:garageId', getGarageOrders);

router.post('/', createNewOrder);

export default router;
