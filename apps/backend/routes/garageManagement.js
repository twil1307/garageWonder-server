import { Router } from "express";
import {
  getGarageOrders,
  getOrderDetail,
  addOrderEvaluation,
  getScheduleOrderByMonth,
  uploadEvaluationImage,
  getUserGarage,
} from "../controller/garageManagement.controller.js";
import { memoryStorage } from "../helper/uploadImg.js";
var router = Router();

router.get("/garage/:garageId", getGarageOrders);

router.get("/order/:orderId", getOrderDetail);

router.get("/owner/:userId", getUserGarage);

router.get("/schedule/:garageId", getScheduleOrderByMonth);

router.post("/evaluation", addOrderEvaluation);

router.post(
  "/evaluation/image",
  memoryStorage.fields([
    { name: "evaluationImage", maxCount: 10 },
  ]),
  uploadEvaluationImage
);

export default router;
