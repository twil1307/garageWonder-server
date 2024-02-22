import mongoose from "mongoose";
const Schema = mongoose.Schema;

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  }
);

brandSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();
  this.name = this.name.toUpperCase();
  next();
});

const Brand = mongoose.model("Brands", brandSchema);

export default Brand;
