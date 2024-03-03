import orderQueue from "../jobs/order.job.js";
import Order from "../models/order.model.js";
import Car from "../models/car.model.js";
import Garage from "../models/garage.model.js";
import { getMaxSlotByDate, getOrderInDatePipeline } from "../pipeline/order.pipeline.js";
import catchAsync from "../utils/catchAsync.js"
import dataResponse from "../utils/dataResponse.js";
import { get3AmAfterBookingDayFromToday, get3AmNextDayInMls, getBeginningOfTheDay, hourToSecond } from "../utils/dateTimeParse.js";
import { redisClient } from "../config/redis.js";
import orderPersistQueue from "../jobs/orderPersist.job.js";

export const createNewOrder = catchAsync(async (req, res, next) => {
    
    orderQueue.add({
        orderData: req.body
    }, {
        attempts: 5
    });

    return res.status(200).json(dataResponse(null, 200, "Your order has been sent to garage Owner!!"));
});

export const getAllGarages = catchAsync(async (req, res, next) => {
    const { garageId } = req.params;

    return res.status(200).json({
        message: 'Get all garage by id ' + garageId
    })
});