import { Router } from 'express';
import { createNewCategory, getAllCategories } from '../controller/category.controller.js';
var router = Router();

router.get('/', getAllCategories);

router.post('/', createNewCategory);

export default router;
