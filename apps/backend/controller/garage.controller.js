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
import { saveMultipleImageMongoose } from '../helper/image.helper.js';

export const createNewGarage =  catchAsync(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const {backgroundImage, garageImages} = retrieveNewGarageImage(req);

  try {

    console.log(req.body);

    console.log(backgroundImage);
    console.log(garageImages);

    const newGarage = new Garage(req.body);

    const listServiceIdInstertd = await saveMultipleGarageServices(req.body.service, newGarage._id, session);

    newGarage.service = listServiceIdInstertd;
    newGarage.rules = JSON.parse(req.body.rules);
    newGarage.backgroundImage = backgroundImage || null;
    newGarage.images = await saveMultipleImageMongoose(garageImages, session) || [];


    // if (newGarage) {
    //   throw new AppError("Something went wrong", 500);
    // }

    await session.abortTransaction();
    // await session.commitTransaction();
    session.endSession();

    return res.json({
      message: 'Sign up new garage successfully'
    });
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

export const getAdditionalService = catchAsync(async (_, res) => {
  const listAditionalService = await AdditionalService.find({});

  return res.status(200).json(dataResponse(listAditionalService));
});

export const createAdditionalService = catchAsync()