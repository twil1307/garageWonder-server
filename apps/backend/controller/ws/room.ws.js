import mongoose from "mongoose"
import Message from "../../models/message.model.js"

export const sendMessage = async (message) => {
    const session = await mongoose.startSession();
    const newMessage = new Message(message);

    session.startTransaction();
    const savedMessage = await newMessage.save({ session });
    
    await session.commitTransaction();
    await session.endSession()
    console.log(savedMessage)

    // TODO: broadcast message
}

export const typingMessage = () => {
    
}

export const joinRoom = (roomId) => {

}

export const test = (socket) => {
    console.log("socket connection")
}
