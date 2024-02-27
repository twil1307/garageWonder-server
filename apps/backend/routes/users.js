import { Router } from 'express';
import { getUser, signUpUser, getUserFirebase } from '../controller/user.controller.js';
var router = Router();

/* GET users listing. */
router.get('/getUserFireBase', getUserFirebase);

router.get('/:uid', getUser);

router.post('/', signUpUser);

export default router;
