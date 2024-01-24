import dotenv from 'dotenv';
dotenv.config();

// model import
import Garage from '../models/garage.model.js'
import AdditionalService from '../models/additionalService.model.js'

// helper import
import mongoose, { Types } from 'mongoose';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { retrieveNewGarageImage } from '../helper/garage.helper.js'
import { deleteMultipleImagesCloudinary, saveMultipleGarageServices } from '../helper/service.helper.js';
import dataResponse from '../utils/dataResponse.js';
import { saveMultipleImageMongoose } from '../helper/image.helper.js';
import { mainPipeline } from '../pipeline/garage.pipeline.js';

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

  const pipeline = mainPipeline(garageName, serviceName, minPrice, maxPrice, true, distance, lgt, lat);

  console.log(JSON.stringify(pipeline));

  const garages = await Garage.aggregate(pipeline);

  console.log(garages);

  return res.status(200).json(dataResponse(garages, 200, 'Get list garage successfully'))
})