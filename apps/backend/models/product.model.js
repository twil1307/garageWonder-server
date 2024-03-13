import mongoose from "mongoose";
const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: {
    type: String,
    enum: ["Noi that", "Ngoai that"],
  },
  brandId: {
    type: Schema.Types.ObjectId,
  },
  series: {
    type: [String],
  },
  model: {
    type: [String],
  },
  year: {
    type: [Number],
  },
  price: {
    type: [Number],
  },
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

const Product = mongoose.model("Products", productSchema);

export default Product;
