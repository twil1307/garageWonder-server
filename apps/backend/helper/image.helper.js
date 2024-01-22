import { Types } from "mongoose";
import Image from "../models/image.model.js"

export const saveMultipleImageMongoose = async (imagesPath, session) => {
    const imagesId = [];
    const imagesInst = imagesPath.map(image => {
        const mongoId = new Types.ObjectId();
        imagesId.push(mongoId);
        return {_id: mongoId, path: image}
    });

    await Image.insertMany(imagesInst, {
        rawResult: true,
        session
    });

    return imagesId;
}