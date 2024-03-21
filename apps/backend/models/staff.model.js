import mongoose from "mongoose";
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  garageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garage",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  authorities: {
    type: [String],
  },
  createdAt: {
    type: Number,
    default: new Date().getTime()
  },
  updatedAt: {
    type: Number,
    default: new Date().getTime()
  }
});

const Staff = mongoose.model("Staffs", staffSchema);

export default Staff;
