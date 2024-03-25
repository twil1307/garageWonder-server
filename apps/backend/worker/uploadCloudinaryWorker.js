import { parentPort, workerData } from 'worker_threads'
import { cloudinaryInst } from '../helper/uploadImg.js';
import { getMultipleImageSize } from '../helper/image.helper.js';
import dotenv from 'dotenv';
dotenv.config();

const uploadCloudinaryWorkerCm = async () => {
    try {

        console.log("Common uploading is launching!");
        
        const { imageUris } = workerData;

        const evaluationImgsResult = await Promise.all((imageUris || []).map(async (file) => {
            return await cloudinaryInst.uploader.upload(file, {
                // resource_type: 'auto',
                timeout: 300000
            });
        }));

        const images = getMultipleImageSize(extractUrlCloudinary(evaluationImgsResult));

        parentPort.postMessage({ images: images });
        
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

const extractUrlCloudinary = (imagesPath) => {
    const imagesInst = imagesPath.map(image => {
        return image.url
    });

    return imagesInst;
}

const retryUploading = async () => {
    const { retry } = workerData;
    let retryCounter = 0;

    while(retryCounter < retry) {
        console.log(`try #${retryCounter}`)
        try {
            await uploadCloudinaryWorkerCm();
            break;
        } catch (err) {
            console.log(err);
            console.log(`Attemp retry ${retryCounter} failed`);
        }
        retryCounter++;
    }
}

await retryUploading();

