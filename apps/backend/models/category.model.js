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

// categorySchema.pre('save', function(next) {
//   console.log('Pre-save occured');
//   console.log(this);
//   this.hello = 'leduc';
//   this.description = 'duccccccccccccccccccccccccc';

//   next();
// })


const Category = mongoose.model("Category", categorySchema);

export default Category;