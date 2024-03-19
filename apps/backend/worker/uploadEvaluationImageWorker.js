import { parentPort, workerData } from 'worker_threads'
import { redisClient } from '../config/redis.js';
import { cloudinaryInst } from '../helper/uploadImg.js';
import { CACHING_CREATING_GARAGE_TIME, IMAGE_UPLOADING_STATUS } from '../enum/garage.enum.js';
import { convertToWebp, getMultipleImageMongooseInst, saveMultipleImageWithSizeMongoose } from '../helper/image.helper.js';
import dotenv from 'dotenv';
import { EVALUATION_UPLOAD } from '../enum/image.enum.js';
dotenv.config();

const writeFileCloud = async () => {
    try {
        
        const { evaluationURIs, orderId } = workerData;

        console.log(orderId);

        const evaluationImgsResult = await Promise.all((evaluationURIs || []).map(async (file) => {
            return await cloudinaryInst.uploader.upload(file, {
                // resource_type: 'auto',
                timeout: 300000
            });
        }));

        const images = await getMultipleImageMongooseInst(extractUrlCloudinary(evaluationImgsResult), undefined, null, EVALUATION_UPLOAD) || [];

        parentPort.postMessage({ imagesUrls: images.imagesUrls, orderId: orderId });
        
    } catch (error) {
        console.log(error);
        throw new Error(error);
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

