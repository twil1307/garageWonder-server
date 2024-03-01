import orderQueue from "../jobs/order.job.js";
import catchAsync from "../utils/catchAsync.js"
import dataResponse from "../utils/dataResponse.js";

export const createNewOrder = catchAsync(async (req, res, next) => {
    
    orderQueue.add({
        orderData: req.body
    }, {
        // jobId: 'orderJob',
        attempts: 5
    });
    
    return res.status(200).json(dataResponse(null, 200, "Your order has been sent to garage Owner!!"));
});