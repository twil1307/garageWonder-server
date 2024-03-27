import { Router } from 'express';
import { retrieveUserDataMiddleware } from '../middleware/userRetrieveDataMiddleware.js'
import {
    createRoom,
    deleteRoom,
    getRooms,
    muteRoom
} from '../controller/room.controller.js'

const router = Router()

router.use(retrieveUserDataMiddleware)

router.post("", createRoom)
router.get("", getRooms)
router.put("", muteRoom)
router.delete("", deleteRoom)

export default router;