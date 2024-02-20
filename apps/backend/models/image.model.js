import mongoose from "mongoose";
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "Image url is required"]
    },
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Garage",
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);


const Image = mongoose.model("Image", imageSchema);

export default Image;