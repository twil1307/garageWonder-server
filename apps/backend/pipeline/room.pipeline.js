import mongoose from "mongoose";
import { Active } from '../models/room.model.js'

export const getRoomsPipeline = (user) => {
  const garageId = user?.garageId;

  return [
    {
      $match: {
        $and: [
          {
            userId: mongoose.Types.ObjectId(user._id)
          },
          {
            status: Active
          }
        ]
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "roomId",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $unwind: "$room",
    },
    {
      $addFields: {
        garageId: "$room.garageId",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "garages",
        localField: "garageId",
        foreignField: "_id",
        as: "garage",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $unwind: "$garage",
    },
    {
      $lookup: {
        from: "messages",
        localField: "roomId",
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
      $unwind: "$latestMessage",
    },
    {
      $addFields: {
        photoUrl: {
          $cond: [
            {
              $eq: ["$garageId", garageId && mongoose.Types.ObjectId(garageId)],
            },
            "$user.photoUrl",
            {
              $arrayElemAt: ["$garage.backgroundImage.url", 0],
            },
          ],
        },
        displayName: {
          $cond: [
            {
              $eq: ["$garageId", garageId && mongoose.Types.ObjectId(garageId)],
            },
            "$user.displayName",
            "$garage.name",
          ],
        },
      },
    },
    {
      $project: {
        user: 0,
        garage: 0,
        room: 0,
      },
    },
  ];
};

export const getRoomOnlineStatusPipeline = (rooms) => {
  const $in = rooms.map(({ _id }) => mongoose.Types.ObjectId(_id))

  return [
    {
      $match: {
        _id: {
          $in,
        },
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "roomId",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $unwind: "$room",
    },
    {
      $lookup: {
        from: "users",
        localField: "room.garageId",
        foreignField: "garageId",
        as: "staffs",
      },
    },
  ]
}
