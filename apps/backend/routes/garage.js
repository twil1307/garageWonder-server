import { Router } from 'express';
import { addOrRemoveFavorite, createInitialGarage, createNewGarage, getAdditionalService, getGarageBasicInfo, getGarageById, getGarageImageById, getGarageService, getListGarages, initialSaveGarage, memoryStorageUpload } from '../controller/garage.controller.js';
import { formDataRetrieve, garageImageUploader, memoryStorage } from '../helper/uploadImg.js'
var router = Router();
import { retrieveUserDataMiddleware } from '../middleware/userRetrieveDataMiddleware.js';
import { hasRole } from '../middleware/userAuthMiddleware.js'
import { ADMIN, GARAGE_OWNER, STAFF, USER } from '../enum/role.enum.js';
import { addGarageStaff, addOrderEvaluation, getEvaluation, getGarageOrders, getOrderDetail, getScheduleOrderByMonth, getUserGarage, moveToStep, setDateSlot, uploadEvaluationImage, uploadEvaluationImageSample } from '../controller/garageManagement.controller.js';

// ==============================================
router.get('/additionalService', getAdditionalService);

router.get('/images/:garageId', getGarageImageById);

router.get('/basicInfo/:garageId', getGarageBasicInfo);

router.get('/service/:garageId', getGarageService);

router.post('/home', retrieveUserDataMiddleware, getListGarages);

router.post('/image',
  memoryStorage.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), 
  memoryStorageUpload
  );

router.put('/favorite', hasRole(USER, STAFF, GARAGE_OWNER, ADMIN), addOrRemoveFavorite);

router.post('/initGarage', initialSaveGarage);

router.post('/createGarage', formDataRetrieve.none(), createInitialGarage);

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]),
  createNewGarage);

router.get('/evaluation/:evaluationId', getEvaluation)

// management ================================
router.get('/management/:userId', getUserGarage);

router.get('/:garageId/management/orders/:orderId', getOrderDetail);

router.get('/:garageId/management/orders', getGarageOrders);

router.get('/:garageId/management/schedule', getScheduleOrderByMonth);

router.post('/:garageId/management/schedule/date-config', setDateSlot);

router.post("/:garageId/management/evaluation", addOrderEvaluation);

router.post("/:garageId/management/staff", addGarageStaff);

router.post("/:garageId/management/step", moveToStep);

router.post(
  "/:garageId/management/evaluation/image",
  memoryStorage.fields([
    { name: "evaluationImage", maxCount: 10 },
  ]),
  uploadEvaluationImage
);

router.post(
  "/:garageId/management/evaluation/image2",
  memoryStorage.fields([
    { name: "image", maxCount: 10 },
  ]),
  uploadEvaluationImageSample
);

router.get('/:garageId', getGarageById);

export default router;
