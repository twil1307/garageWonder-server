import mongoose from "mongoose";
const Schema = mongoose.Schema;

// export type Car = Model & {
//     brandId: string,
//     model: string,
//     releaseYear: number,
//     plateNumber: string,
// }

const carSchema = new Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brands",
  },
  model: {
    type: String,
  },
  releaseYear: {
    type: Number,
  },
  plateNumber: {
    type: String,
  },
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

carSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();
  next();
});

const Brand = mongoose.model("Cars", carSchema);

export default Brand;
