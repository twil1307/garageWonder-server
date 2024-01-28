import mongoose from "mongoose";
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
    maximumSlot: {
      type: Number,
      required: [true, "Maximim garage slot required"],
    },
    dateSlot: [
      {
        type: {
          slot: { type: Number },
          date: { type: Number },
        },
      },
    ],
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
    location: {
      type: {
        type: String
      },
      coordinates: {
        type: [Number],
        required: true
      }
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
      default: []
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
    },
    staff: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the location field
garageSchema.index({ location: '2dsphere' });

garageSchema.path("rules").default([]);
garageSchema.path("additionalFee").default([]);


const Garage = mongoose.model("Garage", garageSchema);

export default Garage;