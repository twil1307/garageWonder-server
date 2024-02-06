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
        return {_id: mongoId, garageId, ...service}
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
