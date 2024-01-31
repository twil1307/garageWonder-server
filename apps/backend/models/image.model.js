import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    path: {
      type: String,
      required: [true, "Image path is required"],
      unique: true,
    },
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
    },
    width: {
      type: Number
    },
    heigh: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);


const Image = mongoose.model("Image", imageSchema);

export default Image;