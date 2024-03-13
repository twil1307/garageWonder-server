import { ITEMS_PER_CURSOR } from "../enum/garage.enum.js";
import { getGaragePagination } from "../helper/garage.helper.js";
import orderQueue from "../jobs/order.job.js";
import Order from "../models/order.model.js";
import { getGarageOrderPipeline } from "../pipeline/order.pipeline.js";
import catchAsync from "../utils/catchAsync.js";
import dataResponse from "../utils/dataResponse.js";
import {
  get3AmAfterBookingDayFromToday,
  getBeginningOfTheDay,
} from "../utils/dateTimeParse.js";

export const createNewOrder = catchAsync(async (req, res, next) => {
  console.log("Order placed");

  console.log(req.body[0].orderTime);
  console.log(getBeginningOfTheDay(req.body[0].orderTime));
  console.log(get3AmAfterBookingDayFromToday(req.body[0].orderTime));

  await orderQueue.add(
    {
      orderData: req.body,
    },
    {
      attempts: 5,
    }
  );

  return res
    .status(200)
    .json(
      dataResponse(null, 200, "Your order has been sent to garage Owner!!")
    );
});

export const getGarageOrders = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { startTime, endTime, limit, cursor, sort } = req.query;

  console.log(cursor);

  const limitNum = Number.parseInt(limit) || ITEMS_PER_CURSOR;

  const garageOrders = await Order.aggregate(
    getGarageOrderPipeline(garageId, startTime, endTime, limitNum, cursor, sort)
  );

  if (garageOrders.length <= 0) {
    return res
      .status(400)
      .json(
        dataResponse(
          [],
          200,
          "Get list garages orders successfully!",
          null,
          null,
          limitNum,
          garageOrders.length
        )
      );
  }

  let { cursorRes, nextCursorResp, respGarage } = getGaragePagination(
    garageOrders,
    limitNum
  );

  return res
    .status(200)
    .json(
      dataResponse(
        respGarage,
        200,
        "Get list garages orders successfully!",
        cursorRes,
        nextCursorResp,
        limitNum,
        respGarage.length || 0
      )
    );
});
