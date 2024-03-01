import Bull from "bull";
import { redisOptions } from "../config/redis.js";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
dotenv.config();

const orderQueue = new Bull("orderQueue", redisOptions);

orderQueue.process(async (payload, done) => {
  const { orderData } = payload.data;

  const newOrder = new Order(orderData);

  console.log(newOrder);

  await newOrder.save();

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
