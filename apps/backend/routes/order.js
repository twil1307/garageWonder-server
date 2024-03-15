import { Router } from 'express';
import { createNewOrder, getGarageOrders, getOrderDetail, addOrderEvaluation } from '../controller/order.controller.js';
var router = Router();

router.get('/garage/:garageId', getGarageOrders);

router.get('/:orderId', getOrderDetail);

router.post('/evaluation', addOrderEvaluation);

router.post('/', createNewOrder);

export default router;
