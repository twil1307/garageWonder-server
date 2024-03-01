import mongoose from "mongoose";
const Schema = mongoose.Schema;

// export type Evaluation = Model & {
//     estimationType: EstimateType;
//     estimateDuration?: [number | null, number | null] | null;
// }

const evaluationSchema = new Schema({
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

evaluationSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();
  next();
});

const Brand = mongoose.model("Evaluations", evaluationSchema);

export default Brand;
