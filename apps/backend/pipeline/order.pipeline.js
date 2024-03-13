import mongoose from "mongoose";
import { getWholeDayInMlSec } from "../utils/dateTimeParse.js";

export const getOrderInDatePipeline = (orderDate) => {
  return [
    {
      $match: {
        $and: [
          {
            orderTime: {
              $gte: orderDate,
            },
          },
          {
            orderTime: {
              $lte: getWholeDayInMlSec(orderDate),
            },
          },
        ],
      },
    },
  ];
};

export const getGarageOrderPipeline = (
  garageId,
  start,
  end,
  limit,
  cursor,
  sort
) => {
  return [
    {
      $match: {
        garageId: mongoose.Types.ObjectId(garageId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userId",
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "serviceIds",
        foreignField: "_id",
        as: "services",
      },
    },
    {
      $unwind: "$userId",
    },
    ...(start && end
      ? [
          {
            $match: {
              $and: [
                {
                  orderTime: { $gte: 1714521600000 },
                },
                {
                  orderTime: { $lte: 1717027200000 },
                },
              ],
            },
          },
        ]
      : []),
    {
      $sort: {
        orderTime: -1,
      },
    },
    ...(cursor
      ? [
          {
            $match: {
              _id: {
                $gte: mongoose.Types.ObjectId(cursor),
              },
            },
          },
        ]
      : []),
    {
      $limit: limit + 1,
    },
  ];
};

export const getMaxSlotByDate = (garageId, orderDate) => {
  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(garageId),
      },
    },
    {
      $project: {
        matchedSlot: {
          $cond: {
            if: {
              $in: [
                orderDate,
                {
                  $map: {
                    input: "$dateSlot",
                    as: "slot",
                    in: "$$slot.date",
                  },
                },
              ],
            },
            then: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$dateSlot",
                    as: "slot",
                    cond: {
                      $eq: ["$$slot.date", orderDate],
                    },
                  },
                },
                0,
              ],
            },
            else: {
              date: orderDate,
              slot: "$defaultSlot",
            },
          },
        },
      },
    },
    {
      $project: {
        dateSlot: "$matchedSlot.slot",
      },
    },
  ];
};
