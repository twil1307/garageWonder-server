import mongoose from "mongoose";
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
    },
    description: {
      type: String
    },
    icon: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);



const Category = mongoose.model("Category", categorySchema);

export default Category;