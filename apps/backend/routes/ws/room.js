import {
  sendMessage,
  typing,
  joinRoom,
  idle,
  updateMessage,
} from "../../controller/ws/room.ws.js";

export default function roomRouter(socket) {
  socket.on("room:send_message", (message, cb) => sendMessage(message, socket, cb));

  socket.on("room:send_update_message", (message, cb) =>
    updateMessage(message, socket, cb)
  );

  socket.on("room:join", (room) => joinRoom(room, socket));

  socket.on("room:send_typing", (room) => typing(room, socket));

  socket.on("room:send_idle", (room) => idle(room, socket));

  socket.on("disconnect", () => {
    Array.from(socket.rooms).forEach((room) => socket.leave(room));
  });
}
