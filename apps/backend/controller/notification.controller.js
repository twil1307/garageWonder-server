import { getFirestore } from "firebase-admin/firestore";
import Notification from "../models/notification.model.js";
import { DEFAULT_NUMBER_NOTI_SHOW } from "../enum/notification.enum.js";
import dataResponse from "../utils/dataResponse.js";
import catchAsync from "../utils/catchAsync.js";
import { getNotiPagination } from "../helper/notification.helper.js";

export const sendNotificationManually = catchAsync(async (req, res, next) => {
  const { to, content } = req.body;

  const notificationInst = new Notification(req.body);
  console.log(notificationInst);
  const newNoti = { ...notificationInst };
  newNoti._doc._id = notificationInst._id.toString();
  newNoti._doc.content = {};
  newNoti._doc.content.orderId = content.orderId;
  newNoti._doc.content.status = content.status;
  newNoti._doc.content.message = content.message;
  newNoti._doc.createdAt = new Date().getTime();

  console.log(newNoti);

  const fireStore = getFirestore();

  const docRef = fireStore.collection("rooms").doc("notifications");

  await docRef.collection(to).doc(notificationInst._id).set(newNoti._doc);

  return res.status(200).json({
    message: "send notification",
  });
});

export const getUserOrGarageNotification = catchAsync(
  async (req, res, next) => {
    const fireStore = getFirestore();

    const { currentId, limit, cursor, hasRead } = req.query;

    const messageRef = fireStore
      .collection("rooms")
      .doc("notifications")
      .collection(currentId);

    let messagesQuery = messageRef.orderBy("createdAt", "desc");

    // if (hasRead) {
    //   const messagesQuery2 = messageRef.where("hasRead", "==", true).orderBy("createdAt", "desc");
    //   const messageResult2 = await messagesQuery2.get();

    //   const result2 = [];

    //   messageResult2.forEach((doc, index) => {
    //     result2.push(doc.data());
    //   });

    //   console.log(result2);
    // }

    if (cursor) {
      const cursorNumber = Number.parseInt(cursor);
      messagesQuery = messagesQuery.startAt(cursorNumber);
    }

    let limitNum = limit ? Number.parseInt(limit) : DEFAULT_NUMBER_NOTI_SHOW;

    messagesQuery = messagesQuery.limit(limitNum + 1);

    const messageResult = await messagesQuery.get();

    const result = [];

    messageResult.forEach((doc, index) => {
      result.push(doc.data());
    });

    if (result.length <= 0) {
      return res
        .status(200)
        .json(
          dataResponse(
            [],
            200,
            "Get list notifications successful!",
            null,
            null,
            limitNum,
            0
          )
        );
    }

    let { cursorRes, nextCursorResp, respGarage } = getNotiPagination(
      result,
      limitNum
    );

    return res
      .status(200)
      .json(
        dataResponse(
          respGarage,
          200,
          "Get list garages successfully!",
          cursorRes,
          nextCursorResp,
          limitNum,
          respGarage.length || 0
        )
      );
  }
);

export const markReadNoti = catchAsync(async (req, res, next) => {
  const { currentId, notificationId } = req.body;
  const fireStore = getFirestore();

  const notificationRef = fireStore
    .collection("rooms")
    .doc("notifications")
    .collection(currentId)
    .doc(notificationId);

  const result = await notificationRef.update({
    hasRead: true,
  });

  console.log(result);

  return res
    .status(200)
    .json(dataResponse(null, 200, "Read notification successfully!"));
});
