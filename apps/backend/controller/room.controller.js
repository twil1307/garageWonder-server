import mongoose from "mongoose";
import Room, {
  UserRoom,
  Active,
  Ignore,
  InActive,
} from "../models/room.model.js";
import Users from "../models/user.model.js";
import { getRoomsPipeline } from "../pipeline/room.pipeline.js";
import dataResponse from "../utils/dataResponse.js";

export const createRoom = async (req, res, next) => {
  const { garageId, userId } = req.body;
  const user = req.user;

  const room = new Room({
    garageId: garageId,
    userId: userId
  });
  const staffs = await Users.find({
    garageId: garageId,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  const newRoom = await room.save({ session });
  const userRooms = [...staffs, { _id: userId }].map(
    ({ _id }) => new UserRoom({ userId: _id, roomId: newRoom._id, status: Active })
  );
  UserRoom.bulkSave(userRooms)

  await session.commitTransaction();
  await session.endSession();

  return res.status(200).json(dataResponse(newRoom));
};

export const getRooms = async (req, res, next) => {
  const user = req.user;

  const rooms = await UserRoom.aggregate(getRoomsPipeline(user));

  return res.status(200).json(dataResponse(rooms));
};

export const muteRoom = async (req, res, next) => {
    const roomId = req.body;

    await UserRoom.findByIdAndUpdate(roomId, {
        $set: {
            status: Ignore
        }
    })

    return res.status(200).json(dataResponse())
};

export const deleteRoom = async (req, res, next) => {
    const roomId = req.body;

    await UserRoom.findByIdAndUpdate(roomId, {
        $set: {
            status: InActive
        }
    })

    return res.status(200).json(dataResponse())
};

export const getRoomOnlineStatus = async (req, res, next) => {
  const user = req.user;
  const { garageId, userId } = req.body;

  if (user?.garageId === garageId) {
    const staffs = await Users.find({ garageId: garageId })
    const isOnline = staffs.some(staff => staff.isOnline)
    const lastActiveAt = Math.max(staffs.map(staff => staff.lastActiveAt || 0))

    return res.status(200).json(dataResponse({
      isOnline,
      lastActiveAt 
    }))
  } else {
    const targetUser = await Users.findById(userId)

    return res.status(200).json(dataResponse({
      isOnline: Boolean(targetUser?.isOnline),
      lastActiveAt: targetUser.lastActiveAt || 0
    }))
  }
}

export const getMessages = async (req, res, next) => {

}