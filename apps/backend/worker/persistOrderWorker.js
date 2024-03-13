import { parentPort, workerData } from "worker_threads";
import dotenv from "dotenv";
import { batchSendNotification } from "../utils/notification.js";
import connectFireBase from "../config/firebase.js";
import Order from "../models/order.model.js";
import setupDatabase, { dbNative } from "../config/database.js";
import mongoose from "mongoose";
dotenv.config();

setupDatabase();

const sendNotification = async () => {
  try {
    // userId: requestOrders[0].userId,
    // completedOrder: JSON.stringify(completedOrder),
    // unCompletedOrder: JSON.stringify(unCompletedOrder)
    await connectFireBase();

    const { completedOrder } = workerData;

    const orderDataParsed = JSON.parse(completedOrder);

    const bulkOps = orderDataParsed.map((el) => {
      el._id = mongoose.Types.ObjectId(el._id);
      el.garageId = mongoose.Types.ObjectId(el.garageId);
      el.userId = mongoose.Types.ObjectId(el.userId);
      el.car.brandId = mongoose.Types.ObjectId(el.car.brandId);
      el.car._id = mongoose.Types.ObjectId(el.car._id);
      el.serviceIds = el.serviceIds.map((serEl) =>
        mongoose.Types.ObjectId(serEl)
      );

      console.log(el);

      return {
        insertOne: {
          document: el,
        },
      };
    });

    const collection = dbNative.collection("orders");

    await collection.bulkWrite(bulkOps);

    parentPort.postMessage({ message: "Persist order success" });
  } catch (error) {
    console.log(error);
    console.log("Error occurred in sendNotificationWorker");
  }
};

await sendNotification();
