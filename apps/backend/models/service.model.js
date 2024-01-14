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
      required: [true, "Service name is required"],
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Description required"],
    },
    price: {
      type: Number,
      required: true,
    },
    icon: {
        type: String,
        required: false
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


module.exports = mongoose.model("Service", serviceSchema);
