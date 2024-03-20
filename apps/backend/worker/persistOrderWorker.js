import { parentPort, workerData } from "worker_threads";
import dotenv from "dotenv";
import { batchSendNotification } from "../utils/notification.js";
import connectFireBase from "../config/firebase.js";
import Order from "../models/order.model.js";
import setupDatabase, { dbNative } from "../config/database.js";
import mongoose from "mongoose";
import {
  getGaragesOrderMode,
  mergeObjects,
  processService,
} from "../helper/service.helper.js";
dotenv.config();

setupDatabase();

const sendNotification = async () => {
  try {
    await connectFireBase();

    const { completedOrder } = workerData;

    const orderDataParsed = JSON.parse(completedOrder);
    const servicesIdUses = {};
    const garageIds = [];

    const bulkOps = orderDataParsed.map((el) => {
      el._id = mongoose.Types.ObjectId(el._id);
      el.garageId = mongoose.Types.ObjectId(el.garageId);
      garageIds.push(mongoose.Types.ObjectId(el.garageId));
      el.userId = mongoose.Types.ObjectId(el.userId);
      el.car.brandId = mongoose.Types.ObjectId(el.car.brandId);
      el.car._id = mongoose.Types.ObjectId(el.car._id);
      el.serviceIds = el.serviceIds.map((serEl) => {
        if (!servicesIdUses[el._id]) {
          servicesIdUses[el._id] = [];
        }
        servicesIdUses[el._id].push(mongoose.Types.ObjectId(serEl));

        return mongoose.Types.ObjectId(serEl);
      });

      return {
        insertOne: {
          document: el,
        },
      };
    });

    const isNeedEvaluateObj = mergeObjects(
      await processService(servicesIdUses)
    );
    const garageOrderMode = await getGaragesOrderMode(garageIds);


    bulkOps.forEach((el, index) => {
      console.log(el.insertOne.document.garageId);
      console.log(garageOrderMode[index]);

      if (!garageOrderMode[index].isAcceptOrderAuto) {
        el.insertOne.document.status = -1;
      } else if (
        isNeedEvaluateObj[el.insertOne.document._id] &&
        isNeedEvaluateObj[el.insertOne.document._id].length > 0
      ) {
        el.insertOne.document.status = 0;
      } else {
        el.insertOne.document.status = 1;
      }
    });

    console.log(JSON.stringify(bulkOps));

    // check if in an order, there is any service require evaluation

    const collection = dbNative.collection("orders");

    await collection.bulkWrite(bulkOps);

    parentPort.postMessage({ message: "Persist order success" });
  } catch (error) {
    console.log(error);
    console.log("Error occurred in sendNotificationWorker");
  }
};

await sendNotification();
