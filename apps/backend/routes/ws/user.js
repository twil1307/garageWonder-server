import { active, offline } from "../../controller/ws/user.ws"

export default function userRouter(socket) {
    
    socket.on("connection", active)

    socket.on("disconnect", (socket) => offline(socket))
}