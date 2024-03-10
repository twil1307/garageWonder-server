import { Router } from 'express';
import { createNewOrder, getAllGarages } from '../controller/order.controller.js';
var router = Router();

router.get('/:garageId', getAllGarages);

router.post('/', createNewOrder);

export default router;
