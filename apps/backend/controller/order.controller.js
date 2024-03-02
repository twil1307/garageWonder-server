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
    
    // orderQueue.add({
    //     orderData: req.body
    // }, {
    //     // jobId: 'orderJob',
    //     attempts: 5
    // });

    const newOrder = new Order(req.body);
    // const newCar = new Car(req.body.car);

    const orderDate = getBeginningOfTheDay(newOrder.orderTime);
    const toDayTimeMil = new Date().getTime();

    if(orderDate < toDayTimeMil) {
        return res.status(200).json(dataResponse(null, 400, 'Date order must be equal or larger than today'))
    }

    const redisKey = `${newOrder.garageId}-${orderDate}`;

    const getCachedGarage = await redisClient.get(redisKey);
    if(!getCachedGarage) {
        const cacheOrderData = [newOrder];
        await redisClient.set(redisKey, JSON.stringify(cacheOrderData), 'EX', get3AmAfterBookingDayFromToday(orderDate) + hourToSecond(1));
        
        // set event for cron job - to persist data from redis to server
        orderPersistQueue.add({
            redisKey: redisKey
        }, {
            delay: get3AmAfterBookingDayFromToday(orderDate)
        });

        return res.status(200).json(dataResponse(null, 200, 'Your order has been recorded'));
        
    }

    const parsedCachedOrder = JSON.parse(getCachedGarage);

    const maximumDateSlot = await Garage.aggregate(getMaxSlotByDate(req.body.garageId, orderDate));

    const slotLimit = maximumDateSlot[0].dateSlot;

    if(slotLimit <= parsedCachedOrder.length) {
        return res.status(400).json(dataResponse(null, 400, 'Garage if fully ordered'));
    }

    const remainingCacheTime = await redisClient.ttl(redisKey);
    parsedCachedOrder.push(newOrder);
    await redisClient.set(redisKey, JSON.stringify(parsedCachedOrder), 'EX', remainingCacheTime);
    
    return res.status(200).json(dataResponse(null, 200, "Your order has been sent to garage Owner!!"));
});

export const getAllGarages = catchAsync(async (req, res, next) => {
    const { garageId } = req.params;

    return res.status(200).json({
        message: 'Get all garage by id ' + garageId
    })
});