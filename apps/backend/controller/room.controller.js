import mongoose from 'mongoose'
import Room from '../models/room.model.js'
import {
    GARAGE_OWNER,
    STAFF
} from '../enum/role.enum.js'
import { getRoomsPipeline } from '../pipeline/room.pipeline.js'
import dataResponse from '../utils/dataResponse.js'

const InActive = 0;
const Active = 1;
const Ignore = 2;

export const createRoom = async (req, res, next) => {
    const { garageId } = req.body;
    const participants = Object.values(req.body).map((id) => ({
        _id: mongoose.Types.ObjectId(id),
        status: Active
    }))

    const room = new Room({
        participants,
        garageId: mongoose.Types.ObjectId(garageId)
    })

    const session = await mongoose.startSession()
    session.startTransaction()

    const newRoom = await room.save({ session })
    
    await session.commitTransaction()
    await session.endSession();

    return res.status(200).json(dataResponse(newRoom))
}

export const getRooms = async (req, res, next) => {
    const user = req.user;

    const rooms = await Room.aggregate(getRoomsPipeline(user))

    return res.status(200).json(dataResponse(rooms))
}

export const muteRoom = async (req, res, next) => {

}

export const deleteRoom = async (req, res, next) => {

}