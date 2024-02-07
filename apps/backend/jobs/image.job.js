import Bull from 'bull';
import { redisClient, redisOptions } from '../config/redis.js';
import { cloudinaryInst } from '../helper/uploadImg.js';
import { CACHING_CREATING_GARAGE_TIME } from '../enum/garage.enum.js';
import { deleteFileInfolder, deleteMultipleFileInFolder, getImagesDevPublicUrlIncluded, getImagesDevPublicUrlIncludedAndDeleted, saveMultipleImageMongoose, saveMultipleImagesLocalBase64, saveSingleImageLocalBase64 } from '../helper/image.helper.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// DEFINE QUEUE
const cloudinaryUploadingQueue = new Bull("cloudinaryUploading", redisOptions);
    
// REGISTER PROCESSER
cloudinaryUploadingQueue.process(async (payload, done) => {

    const { isUploadLocal } = payload.data;

    switch (isUploadLocal) {
        case true:
            await writeFileToServer(payload, done);
            break;
        case false:
            await writeFileCloud(payload, done);
            break;
        default:
            done();
            break;
    }

    
});

cloudinaryUploadingQueue.on('completed', async (job, result) => {
    switch (job.id) {
        case 'garageImageUpload':
            console.log('Image job upload successfully');
            await job.remove();
            break;
        case 'garageImageUploadLocal':
            console.log('Image job upload local successfully');
            await job.remove();
            break;
    
        default:
            break;
    }
});

const writeFileCloud = async (payload, done) => {
    try {
        
        const { backgroundDataURI, garageDataURIs, ipAddress } = payload.data

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
        console.log(convertMultipleImageWebp(garagesResult));

        const garageObj = JSON.parse(cachedCreatingGarage);

        if(garageObj.backgroundImage && garageObj.backgroundImage.includes(process.env.DEV_PUBLIC_URL)) {
            deleteFileInfolder(garageObj.backgroundImage)
        }

        if(garageObj.images) {
            const retrieveImagePath = await getImagesDevPublicUrlIncluded(garageObj._id);

            if(retrieveImagePath.length > 0) {
                deleteMultipleFileInFolder(retrieveImagePath);
                await getImagesDevPublicUrlIncludedAndDeleted(garageObj._id);
            }
        }

        garageObj.images = await handleSavingImage(garagesResult, garageObj._id);
        garageObj.backgroundImage = backgroundResult.url;
        
        // write data to redis
        await redisClient.set(ipAddress, JSON.stringify(garageObj), 'EX', CACHING_CREATING_GARAGE_TIME)

        console.log('Finish uploading image to cloudinary');
        done();
    } catch (error) {
        console.log(error);

        done(new Error(error));
    }
}

const writeFileToServer = async (payload, done) => {
    try {
        
        const { ipAddress, backgroundDataBuffer, garageDataBuffer } = payload.data;
        
        console.log('Start writing file to server for ip: ' + ipAddress);

        const cachedCreatingGarage = await redisClient.get(ipAddress);
        const parsedCreatingGarage = JSON.parse(cachedCreatingGarage);

        if (!cachedCreatingGarage) {
            console.log('Cannot find any garage creating in progress, aborting receive image...');
            done();
            return;
        }

        if (parsedCreatingGarage.backgroundImage || (parsedCreatingGarage.images && parsedCreatingGarage.images.length > 0 )) {
            done();
            return;
        } 
        
        const backgroundFilename = await saveSingleImageLocalBase64(ipAddress, backgroundDataBuffer);
        const garagesFilePaths = await saveMultipleImagesLocalBase64(ipAddress, garageDataBuffer);
        const garageSavedId = await saveMultipleImageMongoose(garagesFilePaths, undefined, parsedCreatingGarage._id, true);

        parsedCreatingGarage.backgroundImage = backgroundFilename;
        parsedCreatingGarage.images = garageSavedId;

        await redisClient.set(ipAddress, JSON.stringify(parsedCreatingGarage), 'EX', CACHING_CREATING_GARAGE_TIME)

        done();
    } catch (error) {
        console.log("Error occured when uploading image", error);
        done(new Error(error));
    }
}

const handleSavingImage = async (garagesResult, garageId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const images = await saveMultipleImageMongoose(convertMultipleImageWebp(garagesResult), undefined, garageId) || [];

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

export default cloudinaryUploadingQueue;