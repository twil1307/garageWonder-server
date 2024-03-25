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
import { dbNative } from "../config/database.js";
import { getGarageDateSlotByDatePipeline } from "../pipeline/garage.pipeline.js";
import {
  mapExistedDateSlot,
  reduceObjectArrayToObj,
} from "../helper/garageManagement.helper.js";
import Notification from "../models/notification.model.js";
import { NOTI_EVALUATION, NOTI_TYPE_EVALUATION, PENDING } from "../enum/notification.enum.js";
import { getOrderEvaluationPipeline } from "../pipeline/evaluation.pipeline.js";

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

  console.log(getDetailOrderPipeline(orderId));

  const orderDetail = await Order.aggregate(getDetailOrderPipeline(orderId));

  return res
    .status(200)
    .json(dataResponse(orderDetail, 200, "Get order detail successfully"));
});

export const addOrderEvaluation = catchAsync(async (req, res, next) => {
  const orderEvaluation = new Evaluation(req.body);
  console.log(orderEvaluation);
  const order = await Order.findById(orderEvaluation.orderId);
  const { garageId } = req.params;
  const { orderId } = req.body;
  orderEvaluation.createdBy = mongoose.Types.ObjectId(garageId);

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

  const notiSentUserContent = {
    orderId: orderId,
    status: PENDING
  }

  const sentUserNoti = new Notification({
    from: garageId, 
    to: order.userId, 
    type: NOTI_EVALUATION, 
    content: notiSentUserContent,
    hasRead: false
  });

  const publicPath = getWorkerPath("sendNotiWorker.js");

  const sendNotificationWorker = new Worker(publicPath, {
    workerData: {
      notiType: NOTI_TYPE_EVALUATION,
      notificationInst: JSON.stringify(sentUserNoti),
    },
  });

  sendNotificationWorker.on("message", async (data) => {
    console.log(data);
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
      $limit: 1,
    },
    {
      $project: {
        _id: 1,
        name: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!garage[0]) {
    return res
      .status(400)
      .json(
        dataResponse(null, 400, "Can't not find garage ID from this user ID!")
      );
  }

  return res
    .status(200)
    .json(dataResponse(garage[0], 200, "Get garage successfully!"));
});

export const setDateSlot = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const data = req.body;

  const dateData = data.map((el) => Number.parseInt(el.date));

  const dateSlotDataPipeline = getGarageDateSlotByDatePipeline(
    garageId,
    dateData
  );

  const existedDateSlot = await Garage.aggregate(dateSlotDataPipeline);

  const existedDateSlotData = mapExistedDateSlot(existedDateSlot);

  // convert this array to object which key is date and value is extra fee
  // then use it below to define the data for extraFeeCreatedAt
  const existedDateExtraFeeObj = reduceObjectArrayToObj(existedDateSlot);

  var bulkOps = data.map((item) => {
    const itemDateNumber = Number.parseInt(item.date);

    if (existedDateSlotData.includes(itemDateNumber)) {
      return {
        updateOne: {
          filter: {
            _id: mongoose.Types.ObjectId(garageId),
          },
          update: {
            $set: {
              ["dateSlot.$[elem]"]: {
                ...item,
                date: itemDateNumber,
                extraFeeCreatedAt:
                  existedDateExtraFeeObj[item.date].extraFee &&
                  existedDateExtraFeeObj[item.date].extraFee !== item.extraFee
                    ? new Date().getTime()
                    : existedDateExtraFeeObj[item.date].extraFeeCreatedAt,
              },
            },
          },
          upsert: true,
          arrayFilters: [{ "elem.date": itemDateNumber }],
        },
      };
    } else {
      return {
        updateOne: {
          filter: {
            _id: mongoose.Types.ObjectId(garageId),
          },
          update: {
            $addToSet: {
              dateSlot: {
                date: itemDateNumber,
                slot: item.slot,
                disabled: item.disabled,
                extraFee: item.extraFee,
                extraFeeCreatedAt: new Date().getTime(),
              },
            },
          },
        },
      };
    }
  });

  const collection = dbNative.collection("garages");

  await collection.bulkWrite(bulkOps);

  return res.status(200).json({
    message: "Upload success",
  });
});

export const moveToStep = catchAsync(async (req, res, next) => {
  const { orderId, step } = req.body;

  // if(step === 1)
});

export const addGarageStaff = catchAsync(async (req, res, next) => {
  const { garageId } = req.params;
  const { userId, accessibility } = req.body;

  const newStaff = new Staff({ garageId, userId, accessibility });

  await Garage.findByIdAndUpdate(
    { _id: mongoose.Types.ObjectId(garageId) },
    {
      $addToSet: {
        staff: mongoose.Types.ObjectId(userId),
      },
    }
  );
  await newStaff.save();
  await Users.findByIdAndUpdate(
    { _id: mongoose.Types.ObjectId(userId) },
    {
      $addToSet: {
        relatedTo: mongoose.Types.ObjectId(garageId),
      },
    }
  );

  logActionForAddStaff("65df5dd37a592fb6b6466ad8", "65e4961d4fbad85252fccd2f");

  return res
    .status(200)
    .json(dataResponse(null, 200, "Add new Staff successfully"));
});

export const getEvaluation = catchAsync(async (req, res, next) => {
  const { evaluationId } = req.params;

  const getEvalPipeline = getOrderEvaluationPipeline(evaluationId);

  const evaluation = await Evaluation.aggregate(getEvalPipeline)

  return res.status(200).json(dataResponse(evaluation[0], 200, "Get evaluation successfully!!"));
});

export const uploadEvaluationImageSample = catchAsync(async (req, res, next) => {
  if (
    !req.files["image"] ||
    req.files["image"].length === 0
  ) {
    return res
      .status(200)
      .json(dataResponse(null, 400, "Background image required"));
  }

  const publicPath = getWorkerPath("uploadCloudinaryWorker.js");

  const imageURIs = [];
  // Process multiple garage images
  req.files["image"].map(async (file) => {
    const garageB64 = Buffer.from(file.buffer).toString("base64");
    const garageDataURI = "data:" + file.mimetype + ";base64," + garageB64;

    imageURIs.push(garageDataURI);
  });

  const localUploadWorker = new Worker(publicPath, {
    workerData: {
      imageUris: imageURIs,
      retry: 7,
    },
  });

  localUploadWorker.on("message", async (data) => {
    console.log(data);
    console.log("upload cloud done");
  });

  return res
    .status(200)
    .json(dataResponse(null, 200, "Upload image successfully!"));
});