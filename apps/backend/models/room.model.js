import mongoose from "mongoose";
const Schema = mongoose.Schema;

const InActive = 0;
const Active = 1;
const Ignore = 2;
export const Status = [Active, InActive, Ignore]

const participantSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  status: {
    type: Number,
    enum: {
      values: Status
    },
    default: Active
  }
}) 

const roomSchema = new Schema({
  participants: [participantSchema],
  hasRead: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  }
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

const Room = mongoose.model("Rooms", roomSchema);

export default Room;
