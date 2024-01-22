import { Router } from 'express';
import { createNewGarage, getAdditionalService, getGarageById } from '../controller/garage.controller.js';
import { garageImageUploader } from '../helper/uploadImg.js'
var router = Router();

router.get('/:garageId', getGarageById);

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]), 
  createNewGarage);

router.get('/additionalService', getAdditionalService);


export default router;
