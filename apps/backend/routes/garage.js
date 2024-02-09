import { Router } from 'express';
import { createInitialGarage, createNewGarage, getAdditionalService, getGarageById, getListGarages, initialSaveGarage, memoryStorageUpload } from '../controller/garage.controller.js';
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

const funcTest = async () => {
  const randomValue = Math.random();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (randomValue < 0.7) {
        // Simulate a successful operation 70% of the time
        resolve('Operation successful');
      } else {
        reject(new Error('Operation failed'));
      }
    }, 2000);
  });
}

const retryUploading = async (retry) => {
  let retryCounter = 0;

  while(retryCounter < (retry || 1)) {
      console.log(`try #${retryCounter}`)
      try {
          await funcTest();
          break;
      } catch (err) {
          console.log(`Attemp retry ${retryCounter} failed`);
      }
      retryCounter++;
  }
}

router.get('/:garageId', getGarageById);

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
