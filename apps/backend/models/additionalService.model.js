import mongoose from "mongoose";
const Schema = mongoose.Schema;

const additionalServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      unique: true
    },
    description: {
      type: String,
      require: false
    },
    price: {
      type: Number,
      required: false
    }
  },
  {
    timestamps: true,
  }
);


const Service = mongoose.model("AdditionalService", additionalServiceSchema);

export default Service;
