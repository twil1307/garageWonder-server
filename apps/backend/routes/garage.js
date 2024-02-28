import { Router } from 'express';
import { addOrRemoveFavorite, createInitialGarage, createNewGarage, getAdditionalService, getGarageBasicInfo, getGarageById, getGarageImageById, getGarageService, getListGarages, initialSaveGarage, memoryStorageUpload } from '../controller/garage.controller.js';
import { formDataRetrieve, garageImageUploader, memoryStorage } from '../helper/uploadImg.js'
var router = Router();
import { retrieveUserDataMiddleware } from '../middleware/userRetrieveDataMiddleware.js';
import { hasRole } from '../middleware/userAuthMiddleware.js'
import { USER } from '../enum/role.enum.js'

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

router.put('/favorite', hasRole(USER), addOrRemoveFavorite);

router.post('/initGarage', initialSaveGarage);

router.post('/createGarage', formDataRetrieve.none(), createInitialGarage);

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]),
  createNewGarage);

router.get('/:garageId', getGarageById);

export default router;
