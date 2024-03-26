import mongoose from "mongoose";

export const getRoomsPipeline = (user) => {
  const garageId = user.garageId;
  const targetIds = [mongoose.Types.ObjectId(user._id)];

  if (garageId) {
    targetIds.push(mongoose.Types.ObjectId(garageId));
  }

  return [
    {
      $match: {
        "participants._id": {
          $in: targetIds,
        },
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "_id",
        foreignField: "roomId",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "latestMessage",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "participants._id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "garages",
        localField: "participants._id",
        foreignField: "_id",
        as: "garage",
      },
    },
    {
      $set: {
        latestMessage: { $arrayElemAt: ["$latestMessage", 0] },
        garage: { $arrayElemAt: ["$garage", 0] },
        user: { $arrayElemAt: ["$user", 0] },
      },
    },
    {
      $addFields: {
        photoUrl: {
          $cond: [
            {
              $eq: ["$garageId", mongoose.Types.ObjectId(garageId)],
            },
            "$user.photoUrl",
            {
              $arrayElemAt: ["$garage.backgroundImage.url", 0],
            },
          ],
        },
      },
    },
    {
      $project: {
        garage: 0,
        user: 0,
        participants: 0
      }
    },
  ];
};
