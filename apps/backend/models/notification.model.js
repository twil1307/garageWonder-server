import mongoose from "mongoose";
import { NOTI_GARAGE_ORDER, NOTI_ORDER, NOTI_VOUCHER, ORDER_ACCEPTED, ORDER_CANCELED, ORDER_PENDING, ORDER_REJECTED } from "../enum/notification.enum.js";
const Schema = mongoose.Schema;

export const notificationTypeEnum = [
  NOTI_ORDER,
  NOTI_GARAGE_ORDER,
  NOTI_VOUCHER,
]

export const orderStatus = [
  ORDER_PENDING,
  ORDER_ACCEPTED,
  ORDER_REJECTED,
  ORDER_CANCELED
]

const notificationSchema = new Schema({
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  type: {
    type: Number,
    enum: notificationTypeEnum,
  },
  content: {
    type: {
      orderId: {
        type: String,
      },
      status: {
        type: Number,
        enum: orderStatus
      },
      allowAction: {
        type: Boolean, // true if garage order mode is manual, false if auto
      },
      progressStatus: {
        type: Number,
        enum: [] // to show 
      }
    }
  },
  extraData: {
    type: Schema.Types.Mixed
  },
  hasRead: {
    type: Boolean,
    default: false
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

// notificationSchema.pre("save", function (next) {
//   this.createdAt = new Date().getTime();
//   this.updatedAt = new Date().getTime();
//   next();
// });

// notificationSchema.pre("updateOne", function (next) {
//   this.updatedAt = new Date().getTime();

//   next();
// });

const Notification = mongoose.model("Notifications", notificationSchema);

export default Notification;
