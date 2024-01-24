import { Router } from 'express';
import { createNewGarage, getAdditionalService, getGarageById, getListGarages } from '../controller/garage.controller.js';
import { garageImageUploader } from '../helper/uploadImg.js'
var router = Router();

router.get('/additionalService', getAdditionalService);

router.get('/:garageId', getGarageById);

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]), 
  createNewGarage);


router.get('/', getListGarages);


export default router;
