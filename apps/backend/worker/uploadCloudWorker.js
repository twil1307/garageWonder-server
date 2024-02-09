import { parentPort, workerData } from 'worker_threads'
import { redisClient } from '../config/redis.js';
import { cloudinaryInst } from '../helper/uploadImg.js';
import { CACHING_CREATING_GARAGE_TIME } from '../enum/garage.enum.js';
import { deleteFileInfolder, deleteMultipleFileInFolder, getImagesDevPublicUrlIncluded, getImagesDevPublicUrlIncludedAndDeleted, getMultipleImageMongooseInst, saveMultipleImageMongoose } from '../helper/image.helper.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const writeFileCloud = async () => {
    try {
        
        const { backgroundDataURI, garageDataURIs, ipAddress } = workerData;

        if(backgroundDataURI && garageDataURIs && ipAddress) {
            console.log("All parameter matched");
        }

        console.log('Ready to upload image to cloudinary for ip: ' + ipAddress);
        
        const cachedCreatingGarage = await redisClient.get(ipAddress);

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

        console.log(backgroundResult.url);
        console.log(extractUrlCloudinary(garagesResult));

        const garageObj = JSON.parse(cachedCreatingGarage);

        console.log(garageObj);

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
        
        // write data to redis
        await redisClient.set(ipAddress, JSON.stringify(garageObj), 'EX', CACHING_CREATING_GARAGE_TIME)

        console.log('Finish uploading image to cloudinary');

        parentPort.postMessage({imagesInst: imgInstSavingMongoose.imagesInst});
        
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
    console.log(workerData);
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

