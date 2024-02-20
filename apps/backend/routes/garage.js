import { Router } from 'express';
import { createInitialGarage, createNewGarage, getAdditionalService, getGarageById, getGarageImageById, getListGarages, initialSaveGarage, memoryStorageUpload } from '../controller/garage.controller.js';
import { formDataRetrieve, garageImageUploader, memoryStorage } from '../helper/uploadImg.js'
var router = Router();
import path from 'path';
import { Worker } from 'worker_threads';
import { getWorkerPath } from '../utils/filePath.js';

router.get('/additionalService', getAdditionalService);

// router.get('/worker', async (req, res, next) => {
//     // const publicPath = path.join(process.cwd(), 'routes', 'worker', 'garage-worker.js');
//     // const publicPath = getWorkerPath('garage-worker.js');

//     // console.log(publicPath);
//     // const garageWorker = new Worker(publicPath, {
//     //   workerData: {
//     //     mark: 100,
//     //     height: 200,
//     //     retry: 4
//     //   },
//     // });

//     await retryUploading(5);

//   return res.status(200).json({
//     message: 'Hello'
//   })
// })

router.get('/:garageId', getGarageById);

router.get('/images/:garageId', getGarageImageById);

router.post('/image',
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
