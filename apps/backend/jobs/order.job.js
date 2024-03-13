import Bull from "bull";
import { redisClient, redisOptions } from "../config/redis.js";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import {
  get3AmAfterBookingDayFromToday,
  getBeginningOfTheDay,
  hourToSecond,
} from "../utils/dateTimeParse.js";
import { getMaxSlotByDate } from "../pipeline/order.pipeline.js";
import { Worker } from "worker_threads";
import Garage from "../models/garage.model.js";
import { getWorkerPath } from "../utils/filePath.js";
dotenv.config();

const orderQueue = new Bull("orderQueue", redisOptions);

orderQueue.process(async (payload, done) => {
  try {
    console.log("Access here");

    const requestOrders = payload.data.orderData;
    const unCompletedOrder = [];
    const completedOrder = [];
    // const newOrder = new Order(req.body);
    // const newCar = new Car(req.body.car);

    for (var i = 0; i < requestOrders.length; i++) {
      const orderDate = getBeginningOfTheDay(requestOrders[i].orderTime);
      const newOrder = new Order(requestOrders[i]);
      console.log(orderDate);
      console.log(get3AmAfterBookingDayFromTodayPro(orderDate));

      const redisKey = `${newOrder.garageId}-${orderDate}`;

      const getCachedGarage = await redisClient.get(redisKey);
      if (!getCachedGarage) {
        completedOrder.push(newOrder);
        const cacheOrderData = [newOrder];
        await redisClient.set(
          redisKey,
          JSON.stringify(cacheOrderData),
          "EX",
          get3AmAfterBookingDayFromTodayPro(orderDate)
        );
        // set event for cron job - to persist data from redis to server
        // orderPersistQueue.add({
        //     redisKey: redisKey
        // }, {
        //     delay: get3AmAfterBookingDayFromToday(orderDate)
        // });

        continue;
      }
      console.log(i);


      const parsedCachedOrder = JSON.parse(getCachedGarage);

      const performanceStart = new Date().getTime();
      const maximumDateSlot = await Garage.aggregate(
        getMaxSlotByDate(newOrder.garageId, orderDate)
      );
      const performanceEnd = new Date().getTime();

      console.log("Time taken: ", performanceEnd - performanceStart);

      const slotLimit = maximumDateSlot[0].dateSlot;

      if (slotLimit <= parsedCachedOrder.length) {
        unCompletedOrder.push(newOrder);
        continue;
        // return res.status(400).json(dataResponse(null, 400, 'Garage if fully ordered'));
      }

      const remainingCacheTime = await redisClient.ttl(redisKey);
      console.log("================");
      console.log(remainingCacheTime);
      parsedCachedOrder.push(newOrder);
      completedOrder.push(newOrder);
      await redisClient.set(
        redisKey,
        JSON.stringify(parsedCachedOrder),
        "EX",
        remainingCacheTime
      );
    }

    console.log("Completed order: ", JSON.stringify(completedOrder));
    console.log("unCompleted order: ", JSON.stringify(unCompletedOrder));

    const publicPath = getWorkerPath("sendNotiWorker.js");
    const persistOrderPath = getWorkerPath("persistOrderWorker.js");

    const sendNotificationWorker = new Worker(publicPath, {
      workerData: {
        userId: requestOrders[0].userId,
        completedOrder: JSON.stringify(completedOrder),
        unCompletedOrder: JSON.stringify(unCompletedOrder),
      },
    });

    sendNotificationWorker.on("message", async (data) => {
      console.log(data);
    });

    if (completedOrder.length > 0) {
      const persistOrderWorker = new Worker(persistOrderPath, {
        workerData: {
          completedOrder: JSON.stringify(completedOrder),
        },
      });

      persistOrderWorker.on("message", async (data) => {
        console.log(data);
      });
    }

    done();
  } catch (error) {
    console.log(error);
    done(error);
  }
});

orderQueue.on("completed", async (job, result) => {
  console.log("Order completed");
  await job.remove();
  return;
});

orderQueue.on("failed", async (job, result) => {
  // await job.remove();
  // if (job.attemptsMade > 5) {
  // }
  return;
});

const get3AmAfterBookingDayFromTodayPro = (dateTime) => {
  try {
      const now = new Date();
      const tomorrow = new Date(Number.parseInt(dateTime));
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(3, 0, 0, 0);

      const delayInMils = (tomorrow.getTime() - now.getTime())/1000;

      // const delaySec = delayInMils / 1000;

      return Math.floor(delayInMils);
      // return 10000;
  } catch (error) {
      console.log("error at get3AmAfterBookingDayFromToday")
  }
  
}

export default orderQueue;
