import mongoose from "mongoose";

export const getOrderEvaluationPipeline = (evaluationId) => {
  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(evaluationId),
      },
    },
    {
      $lookup: {
        from: "images",
        localField: "evaluationImgs",
        foreignField: "_id",
        as: "evaluationImgs",
      },
    },
  ];
};
