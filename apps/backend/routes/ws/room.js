import { test, sendMessage, typingMessage } from '../../controller/ws/room.ws.js'

export default function roomRouter(socket) {
    socket.on("test", test)

    socket.on("message", sendMessage)
}