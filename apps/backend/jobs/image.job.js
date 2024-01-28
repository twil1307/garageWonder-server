import Bull from 'bull';
import { redisClient, redisOptions } from '../config/redis.js';
import { cloudinaryInst } from '../helper/uploadImg.js';
import { CACHING_CREATING_GARAGE_TIME, HOME_IMAGE_SIZE } from '../enum/garage.enum.js';
import { convertUrlPathWithSize, saveMultipleImageMongoose } from '../helper/image.helper.js';
import Garage from '../models/garage.model.js';
import mongoose from 'mongoose';

// DEFINE QUEUE
const burgerQueue = new Bull("burger", redisOptions);
    
// REGISTER PROCESSER
burgerQueue.process(async (payload, done) => {

    try {
        console.log('Ready to upload image');

        const { backgroundDataURI, garageDataURIs, ipAddress } = payload.data
        
        const cachedCreatingGarage = await redisClient.get(ipAddress);

        if (!cachedCreatingGarage) {
            console.log('Cannot find any garage creating in progress, aborting receive image...');
            return;
        }
        
        const backgroundResult = await cloudinaryInst.uploader.upload(backgroundDataURI, {
            // resource_type: 'auto',
            timeout: 300000
        })

        const garagesResult = await Promise.all((garageDataURIs || []).map(async (file) => {
            return await cloudinaryInst.uploader.upload(file, {
                // resource_type: 'auto',
                timeout: 300000
            });
        }));

        console.log(backgroundResult.url);
        console.log(convertMultipleImageWebp(garagesResult));

        const garageObj = new Garage(JSON.parse(cachedCreatingGarage));

        garageObj.images = await handleSavingImage(garagesResult);
        garageObj.backgroundImage = backgroundResult.url;

        console.log(garageObj);
        
        // write data to redis
        await redisClient.setEx(ipAddress, CACHING_CREATING_GARAGE_TIME, JSON.stringify(garageObj))

        console.log('Finish uploading image');
        done();
    } catch (error) {
        console.log(error);

        done(new Error(error));
    }

    
});

const handleSavingImage = async (garagesResult) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const images = await saveMultipleImageMongoose(convertMultipleImageWebp(garagesResult)) || [];

        await session.commitTransaction();
        session.endSession();

        return images;

    } catch (error) {
        console.log(error);

        await session.abortTransaction();
        session.endSession();

        return [];
    }
    

}


const convertMultipleImageWebp = (imagesPath) => {
    const imagesInst = imagesPath.map(image => {
        return image.url
    });

    return imagesInst;
}

export default burgerQueue;