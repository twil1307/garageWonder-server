import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    path: {
      type: String,
      required: [true, "Image path is required"],
      unique: true,
    },
    // width: {
    //   type: Number,
    //   default: 0
    // },
    // heigh: {
    //   type: Number,
    //   default: 0
    // }
  },
  {
    timestamps: true,
  }
);


const Image = mongoose.model("Image", imageSchema);

export default Image;