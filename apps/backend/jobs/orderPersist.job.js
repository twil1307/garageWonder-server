import Bull from "bull";
import { redisClient, redisOptions } from "../config/redis.js";
import dotenv from "dotenv";
import { dbNative } from "../config/database.js";
import mongoose from "mongoose";
dotenv.config();

const orderPersistQueue = new Bull("orderPersistQueue", redisOptions);

orderPersistQueue.process(async (payload, done) => {
  const { redisKey } = payload.data;

  if(!redisKey) {
    console.log("No data to persist this date");
    return;
  }

  const orderDataCached = await redisClient.get(redisKey);
  const orderDataParsed = JSON.parse(orderDataCached);

  const bulkOps = orderDataParsed.map(el => {

    el._id = mongoose.Types.ObjectId(el._id);
    el.garageId = mongoose.Types.ObjectId(el.garageId);
    el.userId = mongoose.Types.ObjectId(el.userId);
    el.car.brandId = mongoose.Types.ObjectId(el.car.brandId); 
    el.serviceIds = el.serviceIds.map(serEl => mongoose.Types.ObjectId(serEl));

    console.log(el);

    return ({
        insertOne: {
            document: el
        }})
  });

  const collection = dbNative.collection('orders');

  await collection.bulkWrite(bulkOps);

  done();
});

orderPersistQueue.on("completed", async (job, result) => {
  console.log("Order completed");
  console.log(result);
  await job.remove();
});

orderPersistQueue.on("failed", async (job, result) => {
  if (job.attemptsMade > 5) {
    await job.remove();
  }
});

export default orderPersistQueue;
