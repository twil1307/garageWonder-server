import mongoose from "mongoose";
import { BOOKING_ESTIMATE_TYPE } from "../enum/booking.enum.js";
import { HAVE_NO_IMAGE, IMAGE_IS_UPLOADING, IMAGE_UPLOADED, IMAGE_UPLOADED_FAIL } from "../enum/image.enum.js";
const Schema = mongoose.Schema;

// export type Evaluation = Model & {
//     estimationType: EstimateType;
//     estimateDuration?: [number | null, number | null] | null;
// }

const evaluationSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
  },
  evaluationImgs: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  imageUploadingStatus: {
    type: Number,
    default: 0,
    enum: [
      HAVE_NO_IMAGE,
      IMAGE_IS_UPLOADING,
      IMAGE_UPLOADED,
      IMAGE_UPLOADED_FAIL,
    ],
  },
  extraFee: {
    type: Number,
    default: 0,
  },
  services: [
    {
      type: {
        serviceId: { type: mongoose.Schema.Types.ObjectId, required: false },
        price: { type: Number, required: false },
      },
    },
  ],
  estimationType: {
    type: Number,
    enum: [
      BOOKING_ESTIMATE_TYPE.SAME_DAY,
      BOOKING_ESTIMATE_TYPE.EXACT_DAY,
      BOOKING_ESTIMATE_TYPE.COMPLETE_IN_RANGE,
      BOOKING_ESTIMATE_TYPE.CANT_ESTIMATE,
    ],
  },
  estimationDuration: {
    type: [Number],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Number,
    default: new Date().getTime(),
  },
  updatedAt: {
    type: Number,
    default: new Date().getTime(),
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
