import { parentPort, workerData } from "worker_threads";
import dotenv from "dotenv";
import { batchSendNotification, sendEvaluationNoti } from "../utils/notification.js";
import connectFireBase from "../config/firebase.js";
import { NOTI_TYPE_EVALUATION, NOTI_TYPE_ORDER } from "../enum/notification.enum.js";
dotenv.config();

const sendNotification = async () => {
  try {
    // userId: requestOrders[0].userId,
    // completedOrder: JSON.stringify(completedOrder),
    // unCompletedOrder: JSON.stringify(unCompletedOrder)
    await connectFireBase();

    const { notiType } = workerData;

    switch (notiType) {
        case NOTI_TYPE_EVALUATION:
            await sendUserEvaluationToConfirm(workerData);
            break;
    
        case NOTI_TYPE_ORDER:
        default:
            await sendOrderStatus(workerData);
            break;
    }


    parentPort.postMessage({ message: "Send notification success" });
  } catch (error) {
    console.log(error);
    console.log("Error occurred in sendNotificationWorker");
  }
};

const sendUserEvaluationToConfirm = async (workerData) => {
    const { notificationInst } = workerData;

    return sendEvaluationNoti(JSON.parse(notificationInst));
}

const sendOrderStatus = async (workerData) => {
  try {
    const { completedOrder, unCompletedOrder } = workerData;

    const completedOrderParsedData = JSON.parse(completedOrder);
    const unCompletedOrderParsedData = JSON.parse(unCompletedOrder);

    await batchSendNotification(
      completedOrderParsedData,
      unCompletedOrderParsedData
    );

  } catch (error) {
    console.log(error);
    console.log("Error occurred in sendNotificationWorker");
  }
};

await sendNotification();
