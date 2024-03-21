import mongoose from "mongoose";
const Schema = mongoose.Schema;

const loggerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
  },
  targetId: {
    type: Schema.Types.ObjectId,
  },
  module: {
    type: Number,
    enum: [1, 2, 3]
  },
  actionType: {
    type: Number,
  },
  detail: {
    type: Object
  },
  createdAt: {
    type: Number,
    default: new Date().getTime()
  },
});

const Logger = mongoose.model("Loggers", loggerSchema);

export default Logger;
