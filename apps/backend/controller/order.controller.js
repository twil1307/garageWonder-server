import orderQueue from "../jobs/order.job.js";
import catchAsync from "../utils/catchAsync.js"
import dataResponse from "../utils/dataResponse.js";
import { get3AmAfterBookingDayFromToday, getBeginningOfTheDay } from "../utils/dateTimeParse.js";

export const createNewOrder = catchAsync(async (req, res, next) => {

    console.log("Order placed");

    console.log(req.body[0].orderTime);
    console.log(getBeginningOfTheDay(req.body[0].orderTime));
    console.log(get3AmAfterBookingDayFromToday(req.body[0].orderTime))
    
    await orderQueue.add({
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