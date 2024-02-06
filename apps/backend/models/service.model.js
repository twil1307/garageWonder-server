import mongoose from "mongoose";
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    garageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Garage",
    },
    name: {
      type: String,
      required: [true, "Service name is required"]
    },
    description: {
      type: String,
      required: [true, "Description required"],
    },
    lowestPrice: {
      type: Number,
      required: true,
    },
    highestPrice: {
      type: Number,
      required: true,
    },
    brand: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
  },
  {
    timestamps: true,
  }
);


const Service = mongoose.model("Service", serviceSchema);

export default Service;
