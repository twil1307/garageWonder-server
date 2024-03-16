import mongoose from "mongoose";
import { BOOKING_ESTIMATE_TYPE } from "../enum/booking.enum.js";
const Schema = mongoose.Schema;

// export type Evaluation = Model & {
//     estimationType: EstimateType;
//     estimateDuration?: [number | null, number | null] | null;
// }

const evaluationSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String
  },
  evaluationImgs: {
    type: [String]
  },
  extraFee: {
    type: Number,
    default: 0
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Number,
    default: new Date().getTime()
  },
  updatedAt: {
    type: Number,
    default: new Date().getTime()
  },
});

// evaluationSchema.pre("save", function (next) {
//   this.createdAt = new Date().getTime();
//   this.updatedAt = new Date().getTime();
//   next();
// });

evaluationSchema.pre("updateOne", function (next) {
  this.updatedAt = new Date().getTime();

  next();
});


const Evaluation = mongoose.model("Evaluations", evaluationSchema);

export default Evaluation;
