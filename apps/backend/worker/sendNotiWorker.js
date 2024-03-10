import { parentPort, workerData } from 'worker_threads'
import dotenv from 'dotenv';
import { batchSendNotification } from '../utils/notification.js';
import connectFireBase from '../config/firebase.js';
dotenv.config();

const sendNotification = async () => {
    try {
        // userId: requestOrders[0].userId,
        // completedOrder: JSON.stringify(completedOrder),
        // unCompletedOrder: JSON.stringify(unCompletedOrder)
        await connectFireBase();

        const {completedOrder, unCompletedOrder} = workerData;

        const completedOrderParsedData = JSON.parse(completedOrder);
        const unCompletedOrderParsedData = JSON.parse(unCompletedOrder);

        await batchSendNotification(completedOrderParsedData, unCompletedOrderParsedData);

        parentPort.postMessage({message: 'Send notification success'});
    } catch (error) {
        console.log(error);
        console.log("Error occurred in sendNotificationWorker")
    }
    
}

await sendNotification();


