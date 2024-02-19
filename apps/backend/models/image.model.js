import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Image url is required"],
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