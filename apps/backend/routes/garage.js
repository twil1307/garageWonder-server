import { Router } from 'express';
import { createInitialGarage, createNewGarage, getAdditionalService, getGarageById, getListGarages, initialSaveGarage, memoryStorageUpload } from '../controller/garage.controller.js';
import { formDataRetrieve, garageImageUploader, memoryStorage } from '../helper/uploadImg.js'
var router = Router();


router.get('/additionalService', getAdditionalService);

router.get('/:garageId', getGarageById);

router.post('/image', 
  // memoryStorage.single('backgroundImage'), 
  // memoryStorage.array('garageImage'),
  memoryStorage.fields([
    { name: 'backgroundImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), 
  memoryStorageUpload
  );

router.post('/initGarage', initialSaveGarage);

router.post('/createGarage', formDataRetrieve.none(), createInitialGarage);

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]), 
  createNewGarage);




router.get('/', getListGarages);


export default router;
