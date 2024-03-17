import { ITEMS_PER_CURSOR } from "../enum/garage.enum.js";
import { getGaragePagination } from "../helper/garage.helper.js";
import {
  estimateHandOffTime,
  getScheduleSlotByMonth,
} from "../helper/order.helper.js";
import Evaluation from "../models/evaluation.model.js";
import Order from "../models/order.model.js";
import Garage from "../models/garage.model.js";
import {
  getDetailOrderPipeline,
  getGarageDateSlotByMonth,
  getGarageOrderPipeline,
  getOrderByMonth,
} from "../pipeline/order.pipeline.js";
import catchAsync from "../utils/catchAsync.js";
import dataResponse from "../utils/dataResponse.js";

export const getGarageOrders = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { startTime, endTime, limit, cursor, sort } = req.query;

  console.log(cursor);

  const limitNum = Number.parseInt(limit) || ITEMS_PER_CURSOR;

  console.log(
    JSON.stringify(
      getGarageOrderPipeline(
        garageId,
        startTime,
        endTime,
        limitNum,
        cursor,
        sort
      )
    )
  );

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

export const getOrderDetail = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const orderDetail = await Order.aggregate(getDetailOrderPipeline(orderId));

  return res
    .status(200)
    .json(dataResponse(orderDetail, 200, "Get order detail successfully"));
});

export const addOrderEvaluation = catchAsync(async (req, res, next) => {
  const orderEvaluation = new Evaluation(req.body);
  const order = await Order.findById(orderEvaluation.orderId);

  if (!order) {
    return res.status(400).json(dataResponse(null, 400, "Order not found!"));
  }

  const estimateTime = estimateHandOffTime(
    orderEvaluation.estimationType,
    order.orderTime,
    orderEvaluation.estimationDuration[1]
  );

  await orderEvaluation.save();
  await Order.findByIdAndUpdate(orderEvaluation.orderId, {
    $set: {
      estimateHandOffTime: estimateTime,
      evaluationId: orderEvaluation._id,
    },
  });

  return res
    .status(200)
    .json(dataResponse(null, 200, "Successfully add evaluation!!"));
});

export const getScheduleOrderByMonth = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { startTime, endTime } = req.query;

  // console.log(garageId);

  const monthSlot = getGarageDateSlotByMonth(
    garageId,
    Number.parseInt(startTime),
    Number.parseInt(endTime)
  );

  const schedulePipeline = getOrderByMonth(
    garageId,
    Number.parseInt(startTime),
    Number.parseInt(endTime)
  );

  console.log(JSON.stringify(schedulePipeline));

  const listOrder = await Order.aggregate(schedulePipeline);
  const listMonthSlots = await Garage.aggregate(monthSlot);

  const result = getScheduleSlotByMonth(
    Number.parseInt(startTime),
    listOrder,
    listMonthSlots
  );

  return res
    .status(200)
    .json(dataResponse(result, 200, "Get list order successfully!"));
});

export const uploadEvaluationImage = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
});
