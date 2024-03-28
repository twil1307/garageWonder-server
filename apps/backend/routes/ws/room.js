import { sendMessage, typing, joinRoom, idle, updateMessage } from '../../controller/ws/room.ws.js'

export default function roomRouter(socket, ns) {
    socket.on("room:send_message", (message) => sendMessage(message, socket, ns))

    socket.on("room:send_update_message", (message) => updateMessage(message, socket))

    socket.on("room:join", (room) => joinRoom(room, socket))

    socket.on("room:send_typing", (room) => typing(room, socket))

    socket.on("room:send_idle", (room) => idle)

    socket.on("disconnect", () => {
        Array.from(socket.rooms).forEach(room => socket.leave(room))
    })
}