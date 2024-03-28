import mongoose from "mongoose";
const Schema = mongoose.Schema;

export const InActive = 0;
export const Active = 1;
export const Ignore = 2;
export const Status = [Active, InActive, Ignore];

const userRoomSchema = new Schema({
  userId: mongoose.Types.ObjectId,
  roomId: mongoose.Types.ObjectId,
  status: {
    type: Number,
    default: Active,
    enum: Status,
  },
});

const roomSchema = new Schema({
  garageId: { type: mongoose.Types.ObjectId, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true },
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

roomSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();
  next();
});

roomSchema.pre("updateOne", function (next) {
  this.updatedAt = new Date().getTime();
  next();
});

export const UserRoom = mongoose.model("UserRoom", userRoomSchema);

const Room = mongoose.model("Rooms", roomSchema);

export default Room;
