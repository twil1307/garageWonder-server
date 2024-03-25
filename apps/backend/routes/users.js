import { Router } from 'express';
import { getUser, signUpUser, getUserFirebase, evaluationUserAction } from '../controller/user.controller.js';
import { isLogin } from '../middleware/userAuthMiddleware.js';
var router = Router();

/* GET users listing. */
router.get('/getUserFireBase', getUserFirebase);

router.post('/evaluation', isLogin(), evaluationUserAction);

router.get('/:uid', getUser);

router.post('/', signUpUser);

export default router;
