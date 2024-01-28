import { Router } from 'express';
import { getPaymentUrl } from '../controller/payment.controller.js';
import { formDataRetrieve } from '../helper/uploadImg.js';
var router = Router();

router.get('/', formDataRetrieve.none(), getPaymentUrl);

export default router;
