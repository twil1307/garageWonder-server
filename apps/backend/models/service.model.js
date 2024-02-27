import mongoose from "mongoose";
import { BOOKING_ESTIMATE_TYPE } from "../enum/booking.enum.js";
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  garageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Garage",
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  lowestPrice: {
    type: Number,
    required: true,
  },
  highestPrice: {
    type: Number,
    required: true,
  },
  brandIds: {
    type: Schema.Types.Mixed,
    // set: value => (Array.isArray(value) ? value : value[0])
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Garage",
  },
  status: {
    type: Boolean,
    default: true,
  },
  isProvidedEvaluation: {
    type: Boolean,
    default: true,
  },
  estimationType: {
    type: Number,
    enum: [
      BOOKING_ESTIMATE_TYPE.SAME_DAY,
      BOOKING_ESTIMATE_TYPE.EXACT_DAY,
      BOOKING_ESTIMATE_TYPE.COMPLETE_IN_RANGE,
      BOOKING_ESTIMATE_TYPE.CANT_ESTIMATE
    ],
  },
  estimationDuration: {
    type: [Number]
  },
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

serviceSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();

  next();
});

serviceSchema.pre("updateOne", function (next) {
  this.updatedAt = new Date().getTime();

  next();
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
