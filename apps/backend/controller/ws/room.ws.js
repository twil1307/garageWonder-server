import mongoose from "mongoose"
import Message from "../../models/message.model.js"
import dataResponse from "../../utils/dataResponse.js";

export const sendMessage = async (message, socket, cb) => {
    const session = await mongoose.startSession();
    const newMessage = new Message(message);

    session.startTransaction();
    const savedMessage = await newMessage.save({ session });
    
    await session.commitTransaction();
    await session.endSession()

    socket.in(message.roomId).emit("room:receive_message", savedMessage)
    cb(dataResponse(savedMessage))
}

export const updateMessage = async (message, socket, cb) => {
    const newMessage = await Message.findByIdAndUpdate(message._id, message, { new: true })

    socket.in(message.roomId).emit("room:receive_update_message", newMessage)
    cb(dataResponse(newMessage))
}

export const typing = (room, socket) => {
    socket.in(room.roomId).emit("room:receive_typing")
}

export const joinRoom = (room, socket) => {
    socket.join(room.roomId)
}

export const idle = (room, socket) => {
    socket.in(room._id).emit("room:receive_idle")
}

