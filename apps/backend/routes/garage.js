import { Router } from 'express';
import { createNewGarage, getAdditionalService } from '../controller/garage.controller.js';
import { formDataRetrieve, garageImageUploaderLocal, garageImageUploader } from '../helper/uploadImg.js'
var router = Router();
import multer from 'multer';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', 
  garageImageUploader.fields([
    { name: "backgroundImage", maxCount: 1 },
    { name: "garageImage", maxCount: 10 }
  ]), 
  createNewGarage);

router.get('/additionalService', getAdditionalService);

export default router;
