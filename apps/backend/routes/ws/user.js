import { online, offline } from "../../controller/ws/user.ws.js"

export default function userRouter(socket) {
    
    socket.on("connection", (user) => online(user, socket))

    socket.on("disconnect", () => offline(socket))
}