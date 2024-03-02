import Bull from "bull";
import { redisClient, redisOptions } from "../config/redis.js";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import { getBeginningOfTheDay, hourToSecond } from "../utils/dateTimeParse.js";
import { getMaxSlotByDate } from "../pipeline/order.pipeline.js";
import Garage from "../models/garage.model.js";
dotenv.config();

const orderQueue = new Bull("orderQueue", redisOptions);

orderQueue.process(async (payload, done) => {
  const { orderData } = payload.data;

  const newOrder = new Order(orderData);

  const orderDate = getBeginningOfTheDay(newOrder.orderTime);
  const redisKey = `${newOrder.garageId}-${orderDate}`;

  const getCachedGarage = await redisClient.get(redisKey);
  if(!getCachedGarage) {
      const cacheOrderData = [newOrder];
      await redisClient.set(redisKey, JSON.stringify(cacheOrderData), 'EX', hourToSecond(24));
      
      // set event for cron job

      console.log("New order created");
      // return res.status(200).json({message: "New order created"});
      
  }

  const parsedCachedOrder = JSON.parse(getCachedGarage);

  const maximumDateSlot = await Garage.aggregate(getMaxSlotByDate(orderData.garageId, orderDate));

  const slotLimit = maximumDateSlot[0].dateSlot;

  if(slotLimit <= parsedCachedOrder.length) {
    console.log("Garage fully booked");
    done();
      // return res.status(400).json(dataResponse(null, 400, 'Garage if fully ordered'));
  }

  const remainingCacheTime = await redisClient.ttl(redisKey);
  parsedCachedOrder.push(newOrder);
  await redisClient.set(redisKey, JSON.stringify(parsedCachedOrder), 'EX', remainingCacheTime);



  // await newOrder.save();

  done();
});

orderQueue.on("completed", async (job, result) => {
  console.log("Order completed");
  console.log(result);
  await job.remove();
});

orderQueue.on("failed", async (job, result) => {
  if (job.attemptsMade > 5) {
    await job.remove();
  }
});

export default orderQueue;
