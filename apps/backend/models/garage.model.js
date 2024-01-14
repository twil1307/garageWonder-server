import mongoose from "mongoose";
import { extraFeeEnum } from "../enum/garage.enum";
const Schema = mongoose.Schema;

const garageSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // hotelType: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "HotelType",
    // },
    name: {
      type: String,
      required: [true, "Garage name is required"],
      unique: true,
    },
    backgroundImage: {
      type: String,
      required: [true, "backgroundImage required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description required"],
    },
    country: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    streetName: {
      type: String,
      required: true,
    },
    streetNumber: {
        type: String,
        required: true,
    },
    longtitude: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    preprationTime: {
        type: Number
    },
    opening: {
      type: String,
      required: true,
    },
    checkin: {
      type: String,
      required: true,
    },
    checkout: {
      type: String,
      required: true,
    },
    averagePrice: {
      type: Number,
      required: false,
    },
    rating: {
      type: {
        communicationPoint: { type: Number, default: 0 },
        accuracyPoint: { type: Number, default: 0 },
        locationPoint: { type: Number, default: 0 },
        valuePoint: { type: Number, default: 0 },
      },
      _id: false,
      default: function () {
        return {
          communicationPoint: 0,
          accuracyPoint: 0,
          locationPoint: 0,
          valuePoint: 0,
        };
      },
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
    },
    images: [
      {
        type: {
          imagePath: { type: String, required: true },
          imageType: { type: Number, required: true },
        },
        required: true,
      },
    ],
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
    },
    Vouchers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Voucher",
      default: [],
    },
    additionalFee: [
      {
        type: {
          fee: { type: Number, default: 0 },
          feeType: {
            type: String,
            enum: extraFeeEnum
          },
        },
      },
    ],
    restrictCheckInDate: {
      type: [Date],
      default: [],
    },
    rules: [
      {
        type: {
          name: { type: String, required: true },
          shortDes: { type: String, required: true },
        },
      },
    ],
    hightlight: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "GarageHighlight",
        default: [],
    },
    service: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Service",
        default: [],
    }
  },
  {
    timestamps: true,
  }
);

hotelSchema.path("rules").default([]);
hotelSchema.path("additionalFee").default([]);


module.exports = mongoose.model("Garage", garageSchema);
