import { parentPort, workerData } from 'worker_threads'
import { redisClient } from '../config/redis.js';
import { cloudinaryInst } from '../helper/uploadImg.js';
import { CACHING_CREATING_GARAGE_TIME } from '../enum/garage.enum.js';
import { convertToWebp, deleteFileInfolder, deleteMultipleFileInFolder, getImagesDevPublicUrlIncluded, getImagesDevPublicUrlIncludedAndDeleted, getMultipleImageMongooseInst, saveMultipleImageMongoose } from '../helper/image.helper.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Garage from '../models/garage.model.js';
dotenv.config();

const writeFileCloud = async () => {
    try {
        
        const { backgroundDataURI, garageDataURIs, ipAddress, cachedCreatingGarage } = workerData;

        if(backgroundDataURI && garageDataURIs && ipAddress) {
            console.log("All parameter matched");
        }

        console.log('Ready to upload image to cloudinary for ip: ' + ipAddress);

        if (!cachedCreatingGarage) {
            console.log('Cannot find any garage creating in progress, aborting receive image...');
            done();
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

        const garageObj = JSON.parse(cachedCreatingGarage);

        if(garageObj.backgroundImage && garageObj.backgroundImage.includes(process.env.DEV_PUBLIC_URL)) {
            console.log("Is deleting file?")
            deleteFileInfolder(garageObj.backgroundImage)
        }

        if(garageObj.images && garageObj.images.length > 0) {
            console.log("Is deleting files list?")
            const retrieveImagePath = await getImagesDevPublicUrlIncluded(garageObj._id);

            if(retrieveImagePath.length > 0) {
                deleteMultipleFileInFolder(retrieveImagePath);
                await getImagesDevPublicUrlIncludedAndDeleted(garageObj._id);
            }
        }

        const imgInstSavingMongoose = await handleGetImageToSave(extractUrlCloudinary(garagesResult), garageObj._id);
        garageObj.images = imgInstSavingMongoose.imagesId;
        garageObj.backgroundImage = backgroundResult.url;

        console.log(garageObj);

        const isCachedDataExisted = await redisClient.get(ipAddress);
        let isUpdateDB = true;
        if (isCachedDataExisted) {
            // write data to redis
            await redisClient.set(ipAddress, JSON.stringify(garageObj), 'EX', CACHING_CREATING_GARAGE_TIME)
            isUpdateDB = !isUpdateDB;
        } 
        // else {
        //     // if there is no garage in redis - which mean that it is saved to DB 
        //     // => update it in the DB
        //     const query = {
        //         _id: garageObj._id
        //     };

        //     const update = {
        //         $set: {
        //             images: garageObj.images,
        //             backgroundImage: garageObj.backgroundImage
        //         }
        //     }

        //     await Garage.findOneAndUpdate(query, update);
        //     console.log('Update data in DB successfully')
        // }
        
        console.log('Finish uploading image to cloudinary');

        parentPort.postMessage({imagesInst: imgInstSavingMongoose.imagesInst, imagesUrls: imgInstSavingMongoose.imagesUrls, backgroundImageUrl: convertToWebp(backgroundResult.url), garageId: garageObj._id, isUpdateDB: isUpdateDB});
        
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

const handleGetImageToSave = async (garagesResult, garageId) => {
    console.log("Handle saving image here", garageId);
    try {
        const images = await getMultipleImageMongooseInst(garagesResult, undefined, garageId, false) || [];

        return images;

    } catch (error) {
        console.log(error);

        return [];
    }
}

const extractUrlCloudinary = (imagesPath) => {
    console.log("Convert multiple");
    console.log(imagesPath);
    const imagesInst = imagesPath.map(image => {
        return image.url
    });

    console.log(imagesInst);

    return imagesInst;
}

const retryUploading = async () => {
    const { retry } = workerData;
    let retryCounter = 0;

    while(retryCounter < retry) {
        console.log(`try #${retryCounter}`)
        try {
            await writeFileCloud();
            break;
        } catch (err) {
            console.log(err);
            console.log(`Attemp retry ${retryCounter} failed`);
        }
        retryCounter++;
    }
}

await retryUploading();

