import { online, offline } from "../../controller/ws/user.ws.js"

export default function userRouter(socket) {
    const userId = socket.handshake.query._id;

    socket.on("user:ping", () => online(userId))
  
    socket.on("disconnect", () => offline(userId))
}