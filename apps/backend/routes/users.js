import { Router } from 'express';
import { getUser, signUpUser } from '../controller/user.controller.js';
var router = Router();

/* GET users listing. */
router.get('/:id', getUser);

router.post('/', signUpUser);

export default router;
