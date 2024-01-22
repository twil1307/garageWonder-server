import mongoose from "mongoose";
import { extraFeeEnum } from "../enum/garage.enum.js";
const Schema = mongoose.Schema;

const garageSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
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
    longitude: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: true,
    },
    openAt: {
      type: String,
      required: true,
    },
    closeAt: {
      type: String,
      require: true
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
    images: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Image",
      default: [],
    },
    reviews: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Review",
    },
    vouchers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Voucher",
      default: [],
    },
    additionalFee: [
      {
        fee: { type: Number, default: 0 },
        type: {
          type: String
        }
      },
    ],
    restrictCheckInDate: {
      type: [String],
      default: [],
    },
    rules: [
      {
        type: {
          name: { type: String, required: true },
          description: { type: String, required: true },
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
    },
    additionalService: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "AdditionalService",
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

garageSchema.path("rules").default([]);
garageSchema.path("additionalFee").default([]);


const Garage = mongoose.model("Garage", garageSchema);

export default Garage;