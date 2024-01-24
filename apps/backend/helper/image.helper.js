import { Types } from "mongoose";
import Image from "../models/image.model.js"
import { HOME_IMAGE_SIZE } from "../enum/garage.enum.js";
import { ALLOW_IMAGE_FORMAT } from "../enum/image.enum.js";

export const saveMultipleImageMongoose = async (imagesPath, session) => {
    const imagesId = [];
    const imagesInst = imagesPath.map(image => {
        const mongoId = new Types.ObjectId();
        imagesId.push(mongoId);
        console.log(convertUrlPathWithSize(image, HOME_IMAGE_SIZE.width, HOME_IMAGE_SIZE.height));
        return {_id: mongoId, path: convertUrlPathWithSize(image, HOME_IMAGE_SIZE.width, HOME_IMAGE_SIZE.height)}
    });

    await Image.insertMany(imagesInst, {
        rawResult: true,
        session
    });

    return imagesId;
}

// resize image by url
const convertUrlPathWithSize = (urlStr, width = HOME_IMAGE_SIZE.width, height = HOME_IMAGE_SIZE.height) => {
    const splitedPath = urlStr.split('upload');

    return convertToWebp(`${splitedPath[0]}upload/w_${width},h_${height}${splitedPath[1]}`);
}

const convertToWebp = (imageUrl) => {
    const splitUrlPart = imageUrl.split('.');

    if(ALLOW_IMAGE_FORMAT.includes(splitUrlPart[splitUrlPart.length - 1])) {
        splitUrlPart[splitUrlPart.length - 1] = 'webp';
        
        return splitUrlPart.join('.');
    }

    return imageUrl
}