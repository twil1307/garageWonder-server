import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config()

export const socketIO = new Server({
    cors: {
        origin: [process.env.FRONTEND_URL, "https://localhost:5173", "https://scaling-space-couscous-r4g5g7565wf5675-5173.app.github.dev"],
    }
})