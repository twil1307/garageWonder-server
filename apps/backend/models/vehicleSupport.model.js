import mongoose from "mongoose";
const Schema = mongoose.Schema;

const vehicleSupportSchema = new Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      unique: true,
    },
    type: {
        type: String,
        required: [true, "Type is required"],
        unique: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      unique: true,
    },
    year: {
        type: Number,
        required: [true, "Vehicle year is required"],
        unique: true,
    },
    brand: {
        type: String,
        required: [true, "Brand is required"],
        unique: true,
    },
    images: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Image',
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Vehicle", vehicleSupportSchema);
