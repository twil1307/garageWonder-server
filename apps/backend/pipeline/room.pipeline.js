import mongoose from "mongoose";
import { Active } from "../models/room.model.js";

export const getRoomsPipeline = (user) => {
  const garageId = user?.garageId;
  const $eq = ["$garageId", garageId && mongoose.Types.ObjectId(garageId)]

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
      }
    },
    {
      $lookup: {
        from: "rooms",
        localField: "roomId",
        foreignField: "_id",
        as: "room"
      }
    },
    {
      $unwind: "$room"
    },
    {
      $lookup: {
        from: "users",
        localField: "room.userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "garages",
        localField: "room.garageId",
        foreignField: "_id",
        as: "garage",
      },
    },
    {
      $unwind: "$user"
    },
    {
      $unwind: "$garage"
    },
    {
      $set: {
        userId: "$room.userId",
        garageId: "$room.garageId",
      }
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
      $unwind: {
        path: "$latestMessage",
        preserveNullAndEmptyArrays: true
      }
    },
    {
        $addFields: {
          photoURL: {
            $cond: [
              {
                $eq
              },
              "$user.photoURL",
              {
                $arrayElemAt: [
                  "$garage.backgroundImage.url",
                  0,
                ],
              },
            ],
          },
          displayName: {
            $cond: [
              {
                $eq
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
        room: 0,
        garage: 0
      }
    }
  ]
};

export const getRoomOnlineStatusPipeline = (user, roomId) => {
  return [
    {
      $match: {
        roomId: mongoose.Types.ObjectId(roomId),
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
