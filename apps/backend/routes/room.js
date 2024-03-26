import { Router } from 'express';
import { retrieveUserDataMiddleware } from '../middleware/userRetrieveDataMiddleware.js'
import {
    createRoom,
    getRooms
} from '../controller/room.controller.js'

const router = Router()

router.use(retrieveUserDataMiddleware)

router.post("", createRoom)

router.get("", getRooms)

export default router;