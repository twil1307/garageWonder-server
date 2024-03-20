import Service from "../models/service.model.js";
import mongoose, { Types } from "mongoose";
import { cloudinaryInst } from "./uploadImg.js";
import { getServicesRequireEvaluation } from "../pipeline/order.pipeline.js";
import Garage from "../models/garage.model.js";
import { getGaragesOrderModePipeline } from "../pipeline/garage.pipeline.js";

export const saveMultipleGarageServices = async (
  listServices,
  garageId,
  session
) => {
  const listServicesJson = JSON.parse(listServices);
  const servicesId = [];

  // assign _id to each element
  const listServicesMongo = listServicesJson.map((service) => {
    const mongoId = new Types.ObjectId();
    servicesId.push(mongoId);
    const { _id, ...restOfService } = service;
    const createdAt = new Date().getTime();
    const updatedAt = new Date().getTime();
    const brandIdsParse = Array.isArray(service.brandIds)
      ? service.brandIds.map((brand) => mongoose.Types.ObjectId(brand))
      : service.brandIds;
    return {
      _id: mongoId,
      garageId,
      createdAt,
      updatedAt,
      brandIds: brandIdsParse,
      ...restOfService,
    };
  });

  await Service.insertMany(listServicesMongo, {
    rawResult: true,
    session,
  });

  return servicesId;
};

export const deleteMultipleImagesCloudinary = async (publicIds) => {
  try {
    await cloudinaryInst.api.delete_resources(publicIds);
    console.log("Delete image successfully");
    return;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const processService = async (object) => {
  const promises = Object.entries(object).map(async ([key, values]) => {
    try {
      console.log(key);
      // Send request for each key-value pair
      const pipeline = getServicesRequireEvaluation(values);
      console.log(JSON.stringify(pipeline));
      const result = await Service.aggregate(pipeline);
      console.log(`Request for key ${key} successful:`, result);
      return { [key]: result };
    } catch (error) {
      console.error(`Error sending request for key ${key}:`, error);
      throw error; // Propagate the error
    }
  });

  // Wait for all requests to be resolved
  return Promise.all(promises);
};

export const getGaragesOrderMode = async (garageIds) => {
  console.log("*");
  console.log(garageIds);
  const listGarageMode = await Garage.aggregate(getGaragesOrderModePipeline(garageIds));

  return listGarageMode;
};

export function mergeObjects(array) {
  return array.reduce((result, current) => {
    for (const key in current) {
      if (Object.prototype.hasOwnProperty.call(current, key)) {
        result[key] = current[key];
      }
    }
    return result;
  }, {});
}
