import { io } from '../../bin/www'
import roomWsRouter from './room.js'
import userWsRouter from './user.js'

const roomNamespace = io.of("/room");
const userNamespace = io.of("/user");

roomNamespace.on("connection", (socket) => roomWsRouter(socket, roomNamespace))
userNamespace.on("connection", (socket) => userWsRouter(socket))