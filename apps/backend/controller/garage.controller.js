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
import { convertMultipleUrlPathWithSize, saveMultipleImageMongoose } from '../helper/image.helper.js';
import { mainPipeline } from '../pipeline/garage.pipeline.js';
import uploadFileQueue from '../jobs/image.job.js';
import {redisClient} from '../config/redis.js'
import { getUserLeftMostIpAddress } from '../helper/userService.js';

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

      // uploadFileQueue.add({
      //   backgroundDataBuffer: backgroundB64,
      //   garageDataBuffer: garageImageBuffer,
      //   ipAddress: ipAddress,
      //   isUploadLocal: true
      // }, {
      //   jobId: 'garageImageUploadLocal',
      //   attempts: 3
      // })
      
      uploadFileQueue.add({
        backgroundDataURI: backgroundDataURI,
        garageDataURIs: garageImageURIs,
        ipAddress: ipAddress,
        isUploadLocal: false
      }, {
        jobId: 'garageImageUpload',
        attempts: 5
      })

      return res.status(200).json({
        message: 'Add image successfully'
      });
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
  
  return res.status(200).json({
    message: 'Save redis successfully'
  })
  
})

export const createInitialGarage = catchAsync(async (req, res, next) => {
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;

  const getGarage = await redisClient.get(getUserLeftMostIpAddress(ipAddress));

  const newGarageParse = new Garage(JSON.parse(getGarage));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const newGarage = new Garage(req.body);

    const listServiceIdInstertd = await saveMultipleGarageServices(req.body.service, newGarage._id, session);
    newGarage._id = getGarage._id;
    newGarage.service = listServiceIdInstertd;
    newGarage.rules = JSON.parse(req.body.rules);
    newGarage.district = JSON.parse(req.body.district);
    newGarage.province = JSON.parse(req.body.province);
    newGarage.ward = JSON.parse(req.body.ward);
    
    const garageCoordinate = JSON.parse(req.body.location);

    if(!garageCoordinate.type) {
      garageCoordinate.type = 'Point'
    }
    newGarage.location = garageCoordinate;
    newGarage.backgroundImage = newGarageParse.backgroundImage;
    newGarage.images = newGarageParse.images;

    await newGarage.save({ session });

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