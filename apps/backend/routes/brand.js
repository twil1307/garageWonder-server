import { Router } from 'express';
import { createNewBrand, getAllBrands } from '../controller/brand.controller.js';
var router = Router();

router.get('/', getAllBrands);

router.post('/', createNewBrand);

export default router;
