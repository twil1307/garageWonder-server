import mongoose from "mongoose";
import { COMPLETE, EVALUATE, FIXING, PREPARE } from "../enum/booking.enum.js";
import { convertDayNumberToMillisecond } from "../utils/dateTimeParse.js";
const Schema = mongoose.Schema;
// export const enum ProcessStatus {
//     Evaluate = 0,
//     Prepare,
//     Fixing,
//     Complete
// }

// export const enum PayType {
//     Cash = 0,
//     Banking,
// }

// export type Order = Model & {
//     garageId: Garage["_id"],
//     userId: User["_id"],
//     evaluationId: Evaluation["_id"],
//     carId: Car["_id"],
//     serviceIds: string[],
//     handOverTime?: number,
//     pickUpTime?: number,
//     totalPrice: number,
//     status: ProcessStatus,
//     hasPaid: boolean,
//     paymentId?: string,
//     payType: PayType
// }

// export type Car = Model & {
//     brandId: string,
//     model: string,
//     releaseYear: number,
//     plateNumber: string,
// }

// export type Evaluation = Model & {
//     estimationType: EstimateType;
//     estimateDuration?: [number | null, number | null] | null;
// }

const orderSchema = new Schema({
  garageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Garage",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evaluations",
  },
  car: {
    type: {
      brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cars",
      },
      model: {
        type: String
      },
      releaseYear: {
        type: Number
      },
      plateNumber: {
        type: String
      }
    }
  },
  serviceIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Service",
  },
  orderTime: {
    type: Number,
  },
  handOverTime: {
    type: Number,
  },
  pickUpTime: {
    type: Number,
  },
  estimateHandOffTime: {
    type: Number
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: EVALUATE,
    enum: [
        EVALUATE,
        PREPARE,
        FIXING,
        COMPLETE
      ], 
  },
  hasPaid: {
    type: Boolean,
    default: false,
  },
  payType: {
    type: String,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
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

orderSchema.pre("save", function (next) {
  this.estimateHandOffTime = this.orderTime + convertDayNumberToMillisecond(2);
  next();
});

orderSchema.pre("updateOne", function (next) {
  this.updatedAt = new Date().getTime();

  next();
});

const Order = mongoose.model("Orders", orderSchema);

export default Order;
