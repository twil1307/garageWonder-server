import { Router } from 'express';
import { retrieveUserDataMiddleware } from '../middleware/userRetrieveDataMiddleware.js'
import {
    createRoom,
    deleteRoom,
    getRooms,
    muteRoom,
    getRoomOnlineStatus
} from '../controller/room.controller.js'

const router = Router()

router.use(retrieveUserDataMiddleware)

router.post("", createRoom)
router.get("", getRooms)
router.put("", muteRoom)
router.delete("/:roomId", deleteRoom)
router.post("/trackingActivity", getRoomOnlineStatus)

export default router;