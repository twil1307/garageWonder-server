import { Types } from "mongoose";
import Image from "../models/image.model.js"
import { HOME_IMAGE_SIZE } from "../enum/garage.enum.js";

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
const convertUrlPathWithSize = (urlStr, width, height) => {
    const splitedPath = urlStr.split('upload');

    return `${splitedPath[0]}upload/w_${width},h_${height}${splitedPath[1]}`;
}