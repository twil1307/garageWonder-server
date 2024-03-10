// import { Server } from 'socket.io';
// import dotenv from 'dotenv';
// dotenv.config()

// export const socketIO = new Server({
//     cors: {
//         origin: [process.env.FRONTEND_URL, "https://localhost:5173", "https://scaling-space-couscous-r4g5g7565wf5675-5173.app.github.dev"],
//     }
// })

import { Server } from "socket.io";

let io;
export const socketConnection = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });
  io.on('connection', (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    // console.log(io);
    // console.log(socket.request);
    socket.on("hello", (from, msg) => {
        console.log(from, msg);
        socket.to("hello2")
                .emit('someone_joined has joined');
    })
    socket.join(socket.request._query.id);
    socket.on('disconnect', () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

export const sendMessage = (roomId, key, message) => {
    console.log(roomId);
    io.to("hello").emit(key, message)
};

export const getRooms = () => io.sockets.adapter.rooms;