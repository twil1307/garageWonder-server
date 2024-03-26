import { io } from '../../bin/www'
import roomWsRouter from './room.js'
import userWsRouter from './user.js'

io.of("/room").on("connection", roomWsRouter)
io.of("/user").on("connection", userWsRouter)
