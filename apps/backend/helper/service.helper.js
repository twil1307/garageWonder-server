import Service from '../models/service.model.js'
import { Types } from 'mongoose';
import { cloudinaryInst } from './uploadImg.js';

export const saveMultipleGarageServices = async (listServices, garageId, session) => {
    const listServicesJson = JSON.parse(listServices);
    const servicesId = [];
    
    // assign _id to each element
    const listServicesMongo = listServicesJson.map(service => {
        const mongoId = new Types.ObjectId();
        servicesId.push(mongoId);
        const { _id, ...restOfService } = service;
        const createdAt = new Date().getTime();
        const updatedAt = new Date().getTime();
        return {_id: mongoId, garageId, createdAt, updatedAt, ...restOfService}
    })

    await Service.insertMany(listServicesMongo, {
        rawResult: true,
        session,
    });

    return servicesId;
}

export const deleteMultipleImagesCloudinary = async (publicIds) => {
    try {
        await cloudinaryInst.api.delete_resources(publicIds);
        console.log('Delete image successfully')
        return;
    } catch (error) {
        console.log(error);
        return error;
    }
}
