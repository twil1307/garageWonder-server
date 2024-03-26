import mongoose from "mongoose"
import Message from "../../models/message.model.js"

export const sendMessage = async (message, socket, ns) => {
    const session = await mongoose.startSession();
    const newMessage = new Message(message);

    session.startTransaction();
    const savedMessage = await newMessage.save({ session });
    
    await session.commitTransaction();
    await session.endSession()

    socket.in(message.roomId).emit("room:receive_message", savedMessage)
}

export const updateMessage = async (message, socket) => {
    const newMessage = await Message.findByIdAndUpdate(message._id, message, { new: true })

    socket.in(message.roomId).emit("room:receive_update_message", newMessage)
}

export const typing = (room, socket) => {
    socket.in(room._id).emit("room:receive_typing")
}

export const joinRoom = (room, socket) => {
    socket.join(room._id)
}

export const idle = (room, socket) => {
    socket.in(room._id).emit("room:receive_idle")
}

