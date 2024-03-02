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
