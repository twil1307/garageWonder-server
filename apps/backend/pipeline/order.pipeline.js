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

export const getDetailOrderPipeline = (orderId) => {
  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(orderId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $lookup: {
        from: "services",
        localField: "serviceIds",
        foreignField: "_id",
        as: "services"
      }
    },
    {
      $project: {
        "user.role": 0,
        "user.favoriteGarage": 0,
        "userId": 0,
        "serviceIds": 0
      }
    },
    {
      $lookup: {
        from: "brands",
        localField: "car.brandId",
        foreignField: "_id",
        as: "car.brand",
      },
    },
    {
      $unwind: "$car.brand",
    },
    {
      $project: {
        "user.role": 0,
        "user.favoriteGarage": 0,
        userId: 0,
        serviceIds: 0,
        "car.brandId": 0,
      },
    },
  ]
}

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
    {
      $lookup: {
        from: "brands",
        localField: "car.brandId",
        foreignField: "_id",
        as: "car.brand"
      }
    },
    {
      $unwind: "$car.brand"
    },
    ...(start && end
      ? [
          {
            $match: {
              $and: [
                {
                  orderTime: { $gte: start },
                },
                {
                  orderTime: { $lte: end },
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
    {
      $project: {
        "car.brandId": 0
      }
    }
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

export const getGarageDateSlotByMonth = (garageId, start, end) => {
  return [
    {
      $match: {
        _id: mongoose.Types.ObjectId(garageId),
      },
    },
    {
      $project: {
        dateSlot: 1,
        defaultSlot: 1,
      },
    },
    {
      $unwind: "$dateSlot",
    },
    {
      $project: {
        defaultSlot: 1,
        date: "$dateSlot.date",
        maximumSlot: "$dateSlot.slot",
      },
    },
    {
      $match: {
        $and: [
          {
            date: {
              $gte: start, //start date
            },
          },
          {
            date: {
              $lte: end, //end date
            },
          },
        ],
      },
    },
  ]
};

export const getOrderByMonth = (garageId, start, end) => {
  return [
    {
      $match: {
        garageId: mongoose.Types.ObjectId(garageId)
      },
    },
    {
      $match: {
        $and: [
          {
            $or: [
              {
                $and: [
                  {
                    orderTime: {
                      $lte: start,
                    },
                  },
                  {
                    estimateHandOffTime: {
                      $gte: end,
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    orderTime: {
                      $lte: start,
                    },
                  },
                  {
                    estimateHandOffTime: {
                      $lt: end,
                      $gt: start,
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    orderTime: {
                      $lt: end,
                      $gt: start,
                    },
                  },
                  {
                    estimateHandOffTime: {
                      $gte: end,
                    },
                  },
                ],
              },
              {
                $and: [
                  {
                    orderTime: {
                      $gt: start,
                    },
                  },
                  {
                    estimateHandOffTime: {
                      $lt: end,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      $addFields: {
        beginningOfTheDay: {
          $subtract: [
            {
              $subtract: [
                "$orderTime",
                {
                  $mod: [
                    "$orderTime",
                    24 * 60 * 60 * 1000,
                  ],
                },
              ],
            },
            7 * 60 * 60 * 1000, // Adjusting for GMT+7 timezone offset
          ],
        },
      },
    },
    {
      $project: {
        beginningOfTheDay: 1,
        orderTime: 1,
        estimateHandOffTime: 1,
      }
    },
    {
      $sort: {
        orderTime: 1
      }
    }
  ];
}

// serviceIds: list ObjectId
export const getServicesRequireEvaluation = (serviceIds) => {
  return [
    {
      $match: {
        _id: {
          $in: serviceIds,
        },
      },
    },
    {
      $match: {
        isProvidedEvaluation: true
      }
    }
  ]
}