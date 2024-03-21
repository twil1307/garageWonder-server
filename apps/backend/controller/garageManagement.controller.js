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
import { Worker } from "worker_threads";
import { getWorkerPath } from "../utils/filePath.js";
import { EVALUATION_UPLOAD, IMAGE_UPLOADED } from "../enum/image.enum.js";
import mongoose from "mongoose";
import { redisClient } from "../config/redis.js";
import { saveMultipleImageWithSizeMongoose } from "../helper/image.helper.js";
import Staff from "../models/staff.model.js";
import Users from "../models/user.model.js";
import { logActionForAddStaff } from "../utils/loggerUtil.js";

export const getGarageOrders = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { startTime, endTime, limit, cursor, sort } = req.query;

  console.log(req.baseUrl);
  console.log(req.params);

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

  // const estimateTime = estimateHandOffTime(
  //   orderEvaluation.estimationType,
  //   order.orderTime,
  //   orderEvaluation.estimationDuration[1]
  // );

  await orderEvaluation.save();
  await Order.findByIdAndUpdate(orderEvaluation.orderId, {
    $set: {
      estimateHandOffTime: orderEvaluation.estimationDuration[1],
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

  if (
    !req.files["evaluationImage"] ||
    req.files["evaluationImage"].length === 0
  ) {
    return res
      .status(200)
      .json(dataResponse(null, 400, "Background image required"));
  }

  const publicPath = getWorkerPath("uploadEvaluationImageWorker.js");

  const evaluationURIs = [];
  const evaluationImageBuffer = [];
  // Process multiple garage images
  req.files["evaluationImage"].map(async (file) => {
    const garageB64 = Buffer.from(file.buffer).toString("base64");
    const garageDataURI = "data:" + file.mimetype + ";base64," + garageB64;

    evaluationImageBuffer.push(garageB64);
    evaluationURIs.push(garageDataURI);
  });

  const localUploadWorker = new Worker(publicPath, {
    workerData: {
      evaluationImageBuffer: evaluationImageBuffer,
      evaluationURIs: evaluationURIs,
      orderId: orderId,
      retry: 7,
    },
  });

  localUploadWorker.on("message", async (data) => {
    console.log(data);
    console.log("upload cloud done");

    const imagesId = await saveMultipleImageWithSizeMongoose(
      data.imagesUrls,
      undefined,
      data.orderId,
      false,
      EVALUATION_UPLOAD
    );

    const savedGarage = await Evaluation.findOne({
      orderId: mongoose.Types.ObjectId(data.orderId),
    });

    if (savedGarage) {
      const query = {
        orderId: mongoose.Types.ObjectId(data.orderId),
      };

      const orderUpdateQuery = {
        _id: mongoose.Types.ObjectId(data.orderId),
      };

      const update = {
        $set: {
          evaluationImgs: imagesId,
          imageUploadingStatus: IMAGE_UPLOADED,
        },
      };

      const orderStatusUpdateQuery = {
        $set: {
          status: 1,
        },
      };

      await Evaluation.findOneAndUpdate(query, update);
      await Order.findByIdAndUpdate(orderUpdateQuery, orderStatusUpdateQuery);
    } else {
      // set cron job for later update
      await redisClient.set(
        data.orderId,
        JSON.stringify(data.imagesUrls),
        "EX",
        3600
      );
    }

    console.log("Image upload for evaluation done!");
  });

  return res
    .status(200)
    .json(dataResponse(null, 200, "Upload image successfully!"));
});

export const getUserGarage = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const garage = await Garage.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
      },
    },
    {
      $limit: 1
    },
    {
      $project: {
        _id: 1,
        name: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  if (!garage[0]) {
    return res
      .status(400)
      .json(dataResponse(null, 400, "Can't not find garage ID from this user ID!"));
  }

  return res
    .status(200)
    .json(dataResponse(garage[0], 200, "Get garage successfully!"));
});

export const setDateSlot = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { date, slot, disabled } = req.body;

  const query = {
    _id: mongoose.Types.ObjectId(garageId)
  };

  const update = {
    $set: {
      dateSlot: {
        date: date,
        slot: slot,
        disabled: !disabled ? false : disabled 
      }
    }
  }

  const options = {
    upsert: true
  }

  const garageFind = await Garage.updateOne(query, update, options);

  return res.status(200).json({
    date, slot, disabled, garageId
  })
});

export const moveToStep = catchAsync(async (req, res, next) => {
  const { orderId, step } = req.body;

  // if(step === 1)
});

export const addGarageStaff = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { userId, accessibility } = req.body;

  const newStaff = new Staff({garageId, userId, accessibility});

  await Garage.findByIdAndUpdate({_id: mongoose.Types.ObjectId(garageId)}, {
    $addToSet: {
      staff: mongoose.Types.ObjectId(userId)
    }
  })
  await newStaff.save();
  await Users.findByIdAndUpdate({_id: mongoose.Types.ObjectId(userId)}, {
    $addToSet: {
      relatedTo: mongoose.Types.ObjectId(garageId)
    }
  });
  
  logActionForAddStaff("65df5dd37a592fb6b6466ad8", "65e4961d4fbad85252fccd2f");

  return res.status(200).json(dataResponse(null, 200, "Add new Staff successfully"));
});