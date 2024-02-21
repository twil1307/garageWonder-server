import mongoose from "mongoose";
const Schema = mongoose.Schema;

const garageSchema = new Schema(
  {
    userId: {
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
      type: String
    },
    status: {
      type: Number,
      default: 0,
    },
    isVerify: {
      type: Boolean,
      default: false
    },
    description: {
      type: String
    },
    defaultSlot: {
      type: Number
    },
    dateSlot: [
      {
        type: {
          slot: { type: Number },
          date: { type: Number },
        },
      },
    ],
    address: { type: String },
    location: {
      type: {
        type: String
      },
      coordinates: {
        type: [Number]
      }
    },
    openAt: {
      type: String,
      required: false,
    },
    closeAt: {
      type: String,
      require: false
    },
    checkin: {
      type: String,
      required: false,
    },
    checkout: {
      type: String,
      required: false,
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
          name: { type: String, required: false },
          description: { type: String, required: false },
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
    additionalServices: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "AdditionalService",
      default: [],
    },
    staff: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: []
    },
    createdAt: {
      type: Number
    },
    updatedAt: {
      type: Number
    }
  },
  // {
  //   timestamps: true,
  // }
);

// Create a 2dsphere index on the location field
garageSchema.index({ location: '2dsphere' });

garageSchema.path("rules").default([]);
garageSchema.path("additionalFee").default([]);

garageSchema.pre('save', function(next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();

  next();
});

garageSchema.pre('updateOne', function(next) {
  this.updatedAt = new Date().getTime();

  next();
})

const Garage = mongoose.model("Garage", garageSchema);

export default Garage;