import { getFirestore } from "firebase-admin/firestore";
import dataResponse from "./dataResponse.js";
import Notification from "../models/notification.model.js";
import { NOTI_GARAGE_ORDER, NOTI_ORDER, ACCEPTED, REJECTED } from "../enum/notification.enum.js";
import mongoose from "mongoose";

// receive notificationInst as a instance of Notification() only
export const sendSingleNotification = async (notificationInst) => {
    try {
        console.log(JSON.stringify(notificationInst._doc));
        const notificationSend = { ...notificationInst };
        notificationSend._doc._id = notificationInst?._id.toString();
        notificationSend._doc.content = notificationInst?.content?._id.toString();
    
        console.log(notificationSend);
    
        const fireStore = getFirestore();
    
        const docRef = fireStore.collection('rooms').doc('notifications');
    
        await docRef.collection(notificationInst.to).doc(notificationInst._id).set(notificationSend._doc);
    
        return dataResponse(notificationSend._doc, 200, "Send notification successfully");
    } catch (error) {
        console.log(error);
        return dataResponse(null, 400, "Send notification failed");
    }
}

// receive notificationInst as a instance of Notification() only
export const sendEvaluationNoti = async (notificationInst) => {
    try {
        const fireStore = getFirestore();
    
        const docRef = fireStore.collection('rooms').doc('notifications');
    
        await docRef.collection(notificationInst.to).doc(notificationInst._id).set(notificationInst);
    
        return dataResponse(notificationInst, 200, "Send notification successfully");
    } catch (error) {
        console.log(error);
        return dataResponse(null, 400, "Send notification failed");
    }
}

export const batchSendNotification = async (completedOrder, unCompletedOrder) => {
    const fireStore = getFirestore();

    const batch = fireStore.batch();
    const docRef = fireStore.collection('rooms').doc('notifications');

    if(completedOrder && completedOrder.length > 0) {
        completedOrder.forEach((item, index) => {
            const sentUserNotificationData = convertOrderToNotification(item, ACCEPTED, false, index + 1);
            const sentGarageNotificationData = convertOrderToNotification(item, ACCEPTED, true, index + 1);
            
            const userRef = docRef.collection(item.userId.toString()).doc(sentUserNotificationData._id)
            const garageRef = docRef.collection(item.garageId.toString()).doc(sentGarageNotificationData._id)
        
            batch.set(userRef, sentUserNotificationData);
            batch.set(garageRef, sentGarageNotificationData);
        });
    }

    if(unCompletedOrder && unCompletedOrder.length > 0) {
        unCompletedOrder.forEach((item, index) => {
            const notificationData = convertOrderToNotification(item, REJECTED, false, index + 1);
            
            const userRef = docRef.collection(item.userId.toString()).doc(notificationData._id)
        
            batch.set(userRef, notificationData);
        });
    }

    batch.commit();
};

export const convertOrderToNotification = (order, status, isSentToGarage = false, count = 1) => {
    const newNotification = new Notification();
    const notificationClone = {...newNotification};

    notificationClone._doc._id = newNotification._id.toString();
    notificationClone._doc.from = !isSentToGarage ? order.garageId.toString() : order.userId.toString();
    notificationClone._doc.to = !isSentToGarage ? order.userId.toString() : order.garageId.toString();

    if (!notificationClone._doc.content) {
        notificationClone._doc.content = {};
    }
    
    notificationClone._doc.content.orderId = order._id.toString();
    notificationClone._doc.content.status = status;
    notificationClone._doc.createdAt = new Date().getTime() + count;
    notificationClone._doc.type = isSentToGarage ? NOTI_GARAGE_ORDER : NOTI_ORDER;
    
    if (isSentToGarage) {
        notificationClone._doc.content.message = "New order is coming!!";
    } else {
        notificationClone._doc.content.message = status === ACCEPTED ? "Your order has been placed successfully!" : "Your order has been rejected!";
    }

    return notificationClone._doc;
}