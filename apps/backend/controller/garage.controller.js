import dotenv from 'dotenv';
dotenv.config();

// model import
import Garage from '../models/garage.model.js'
import AdditionalService from '../models/additionalService.model.js'

// helper import
import mongoose from 'mongoose';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { retrieveNewGarageImage } from '../helper/garage.helper.js'
import { deleteMultipleImagesCloudinary, saveMultipleGarageServices } from '../helper/service.helper.js';
import dataResponse from '../utils/dataResponse.js';
import { convertMultipleUrlPathWithSize, convertToWebp, saveMultipleImageMongoose, saveMultipleImageWithSizeMongoose } from '../helper/image.helper.js';
import { getGarageBasicInfoPipeline, getGarageServicePipeline, mainPipeline } from '../pipeline/garage.pipeline.js';
import uploadFileQueue from '../jobs/image.job.js';
import {redisClient} from '../config/redis.js'
import { getUserLeftMostIpAddress } from '../helper/userService.js';
import { Worker } from 'worker_threads';
import { getWorkerPath } from '../utils/filePath.js';
import Image from '../models/image.model.js';
import { DETAIL_IMAGE_SIZE, IMAGE_UPLOADING_STATUS } from '../enum/garage.enum.js';
import Service from '../models/service.model.js';

/**
 * @POST
 * @Name: Create new garage
 */
export const createNewGarage =  catchAsync(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {backgroundImage, garageImages} = retrieveNewGarageImage(req);

  try {

    const newGarage = new Garage(req.body);

    const listServiceIdInstertd = await saveMultipleGarageServices(req.body.service, newGarage._id, session);
    newGarage.service = listServiceIdInstertd;
    newGarage.rules = JSON.parse(req.body.rules);
    newGarage.backgroundImage = backgroundImage || null;
    newGarage.images = await saveMultipleImageMongoose(garageImages, session) || [];
    
    const garageCoordinate = JSON.parse(req.body.location);

    if(!garageCoordinate.type) {
      garageCoordinate.type = 'Point'
    }
    newGarage.location = garageCoordinate;

    await newGarage.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(dataResponse(newGarage, 200, 'Create new garage successfully'));
  } catch (error) {
    console.log(error);

    await session.abortTransaction();
    session.endSession();

    const imagesUploaded = [req.files['backgroundImage'][0], ...(req.files['garageImage'] || [])];

    if(imagesUploaded && imagesUploaded.length > 0) {
      const publicImageIds = imagesUploaded.map(image => image.filename);
      await deleteMultipleImagesCloudinary(publicImageIds);
    }

    throw new AppError(error.message, error.status);
  }
});

/**
 * @GET
 * @Name: get additional service
 */
export const getAdditionalService = catchAsync(async (_, res) => {
  const listAditionalService = await AdditionalService.find({});

  return res.status(200).json(dataResponse(listAditionalService));
});


/**
 * @GET
 * @Name: get garage by id
 */
export const getGarageById = catchAsync(async (req, res) => {
  console.log(req.params);

  const respGarage = await Garage.find({_id: req.params.garageId})
  .populate({
    path: 'images',
    select: 'path',
    options: {
      width: 600,
      height: 800
    }
  });

  if(!respGarage || respGarage.length === 0) {
    throw new AppError('Garage not existed', 400);
  }

  return res.status(200).json(dataResponse(respGarage, 200, 'Get garage successfully'));
})

/**
 * @GET
 * @Name: get garage image by id
 */
export const getGarageImageById = catchAsync(async (req, res) => {
  const { garageId } = req.params;

  console.log(garageId);

  const respGarage = await Image.find({
    $and: [
      {garageId: garageId},
      
    ]
  });

  return res.status(200).json(dataResponse(respGarage, 200, 'Get garage image successfully'));
})

/**
 * @GET
 * @Name: get garage basic info by id
 */
export const getGarageBasicInfo = catchAsync(async (req, res) => {
  const { garageId } = req.params;

  console.log(garageId);

  const getGarageBasicInfoQuery = getGarageBasicInfoPipeline(garageId);

  const respGarage = await Garage.aggregate(getGarageBasicInfoQuery);

  return res.status(200).json(dataResponse(respGarage, 200, 'Get garage successfully'));
})

/**
 * @GET
 * @Name: get garage service by id
 */
export const getGarageService = catchAsync(async (req, res) => {
  const { garageId } = req.params;

  console.log(garageId);

  const getGarageServiceQuery = getGarageServicePipeline(garageId);

  const respGarage = await Service.aggregate(getGarageServiceQuery);

  return res.status(200).json(dataResponse(respGarage, 200, 'Get garage successfully'));
})


/**
 * @GET
 * @Name: get garages list
 */
export const getListGarages = catchAsync(async (req, res) => {

  console.log(req.query);

  const { garageName, serviceName, minPrice, maxPrice, findNearby, distance, lgt, lat } = req.query;

  const pipeline = mainPipeline(garageName, serviceName, minPrice, maxPrice, findNearby || false, distance, lgt, lat);

  console.log(JSON.stringify(pipeline));

  const garages = await Garage.aggregate(pipeline);

  const garagesImagesPath = convertMultipleUrlPathWithSize(garages);

  console.log(garagesImagesPath);

  return res.status(200).json(dataResponse(garagesImagesPath, 200, 'Get list garage successfully'))
})

export const memoryStorageUpload = async (req, res) => {
  const ipAddress = getUserLeftMostIpAddress(req.header('x-forwarded-for') || req.socket.remoteAddress);
  console.log("Incoming ip address: " + ipAddress);
  const publicPath = getWorkerPath('uploadCloudWorker.js');

  try {
    if (req.files['backgroundImage']) {
      const backgroundFile = req.files['backgroundImage'][0];
      const backgroundB64 = Buffer.from(backgroundFile.buffer).toString("base64");
      const backgroundDataURI = "data:" + backgroundFile.mimetype + ";base64," + backgroundB64;

      const garageImageURIs = [];
      const garageImageBuffer = [];
      // Process multiple garage images
      (req.files['images'] || []).map(async (file) => {
        const garageB64 = Buffer.from(file.buffer).toString("base64");
        const garageDataURI = "data:" + file.mimetype + ";base64," + garageB64;
  
        garageImageBuffer.push(garageB64);
        garageImageURIs.push(garageDataURI)
      });

      const cachedCreatingGarage = JSON.parse(await redisClient.get(getUserLeftMostIpAddress(ipAddress)));
      cachedCreatingGarage.imageUploadingStatus = IMAGE_UPLOADING_STATUS.PENDING;

      await redisClient.set(ipAddress, JSON.stringify(cachedCreatingGarage), 'EX', 3600);

      const localUploadWorker = new Worker(publicPath, {
        workerData: {
            backgroundDataURI: backgroundDataURI,
            garageDataURIs: garageImageURIs,
            ipAddress: ipAddress,
            isUploadLocal: false,
            retry: 7
          },
      })

      localUploadWorker.on('message', async (data) => {
        console.log(data);
        // await Image.insertMany(data.imagesInst)
        const imagesId = await saveMultipleImageWithSizeMongoose(data.imagesUrls, undefined, data.garageId, false);

        const savedGarage = await Garage.findById(data.garageId);
        console.log(savedGarage);
        if(savedGarage) {
          const query = {
            _id: mongoose.Types.ObjectId(data.garageId)
          };
    
          const update = {
            $set: {
              images: imagesId,
              backgroundImage: data.backgroundImageUrl,
              imageUploadingStatus: IMAGE_UPLOADING_STATUS.SUCCESS
            }
          };
    
          await Garage.findOneAndUpdate(query, update);
          console.log('Update data in DB successfully') 
        }
        console.log('upload cloud done');
      });

      return res.status(200).json(dataResponse(null, 200, 'Uploading image is pending!!'));
    }
  } catch (error) {
    console.log(error);
    return res.json({
      error: error
    });
  }
}

export const initialSaveGarage = catchAsync(async (req, res, next) => {

  const newGarage = new Garage();

  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
    
  await redisClient.set(getUserLeftMostIpAddress(ipAddress), JSON.stringify(newGarage), 'EX', 3600);
  
  return res.status(200).json(dataResponse(null, 200, 'Initial create hotel successfully!!'));
  
})

export const createInitialGarage = catchAsync(async (req, res, next) => {
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;

  const getGarage = await redisClient.get(getUserLeftMostIpAddress(ipAddress));

  const newGarageParse = JSON.parse(getGarage);

  const session = await mongoose.startSession();
  session.startTransaction();

  console.log(typeof req.body.district);
  try {

    const newGarage = new Garage(req.body);

    const listServiceIdInstertd = req.body.service ? await saveMultipleGarageServices(req.body.service, newGarageParse._id, session) : null;
    newGarage._id = newGarageParse._id;
    newGarage.service = listServiceIdInstertd ?? null;
    newGarage.rules = JSON.parse(req.body.rules || null);
    newGarage.imageUploadingStatus = newGarageParse.imageUploadingStatus;
    newGarage.additionalServices = JSON.parse(req.body.additionalServices).map((item) => mongoose.Types.ObjectId(item))
    const garageCoordinate = JSON.parse(req.body.location || null);

    if(!garageCoordinate.type) {
      garageCoordinate.type = 'Point'
    }
    newGarage.location = garageCoordinate;
    newGarage.backgroundImage = newGarageParse.backgroundImage ? convertToWebp(newGarageParse.backgroundImage) : null;
    newGarage.images = newGarageParse.images?.map(img => mongoose.Types.ObjectId(img));

    console.log(newGarage);

    await newGarage.save({ session });

    // await redisClient.del(getUserLeftMostIpAddress(ipAddress));

    // await session.abortTransaction();
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(dataResponse(newGarage, 200, 'Create new garage successfully'));
  } catch (error) {
    console.log(error);

    await session.abortTransaction();
    session.endSession();

    throw new AppError(error.message, error.status);
  }

})