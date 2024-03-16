import { Router } from 'express';
import { getGarageOrders, getOrderDetail, addOrderEvaluation, getScheduleOrderByMonth } from '../controller/garageManagement.controller.js';
var router = Router();

router.get('/garage/:garageId', getGarageOrders);

router.get('/order/:orderId', getOrderDetail);

router.get('/schedule/:garageId', getScheduleOrderByMonth);

router.post('/evaluation', addOrderEvaluation);

export default router;
