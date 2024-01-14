import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    path: {
      type: String,
      required: [true, "Image path is required"],
      unique: true,
    },
    type: {
        type: String,
        required: [true, "Image type is required"],
        unique: true,
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Image", imageSchema);
