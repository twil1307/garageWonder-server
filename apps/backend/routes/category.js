import { Router } from 'express';
import { createNewCategory, getAllCategories, getCategoryById, getCategoryByMultipleIds } from '../controller/category.controller.js';
var router = Router();

router.get('/getMultiple', getCategoryByMultipleIds);

router.get('/:id', getCategoryById);

router.get('/', getAllCategories);

router.post('/', createNewCategory);

export default router;
