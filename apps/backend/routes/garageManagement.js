import { Router } from 'express';
import { getGarageOrders, getOrderDetail, addOrderEvaluation } from '../controller/garageManagement.controller.js';
var router = Router();

router.get('/garage/:garageId', getGarageOrders);

router.get('/order/:orderId', getOrderDetail);

router.get('/schedule/:garageId', getOrderDetail);

router.post('/evaluation', addOrderEvaluation);

export default router;
