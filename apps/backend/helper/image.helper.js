import { Types } from "mongoose";
import Image from "../models/image.model.js"
import { HOME_IMAGE_SIZE, TOTAL_IMAGE_SIZE } from "../enum/garage.enum.js";
import { ALLOW_IMAGE_FORMAT } from "../enum/image.enum.js";
import path from 'path';
import fs from 'fs';
import sharp from 'sharp'
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import { dbNative } from "../config/database.js";
import mongoose from "mongoose";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMultipleImageMongooseInst = async (imagesPath, session, garageId, isUploadLocal = false) => {
  console.log(imagesPath);
  const imagesId = [];
  const imagesUrls = [];
  const imagesInst = imagesPath.map(image => {
      const mongoId = new Types.ObjectId();
      imagesId.push(mongoId);
      imagesUrls.push(image);
      return {_id: mongoId.toString(), path: image, garageId: garageId}
  });

  console.log(imagesInst);

  const insertOption = {
      rawResult: true
  }

  if (session) {
      insertOption.session = session;
  }

  return {imagesId, imagesInst: imagesInst || [], insertOption, imagesUrls: imagesUrls || []};
}

export const saveMultipleImageMongoose = async (imagesPath, session, garageId, isUploadLocal = false) => {
    console.log(imagesPath);
    const imagesId = [];
    const imagesInst = imagesPath.map(image => {
        const mongoId = new Types.ObjectId();
        imagesId.push(mongoId);
        const pathImage = !isUploadLocal ? convertUrlPathWithSize(image, HOME_IMAGE_SIZE.width, HOME_IMAGE_SIZE.height) : image;
        // const pathImage = image;
        return {_id: mongoId, path: pathImage, garageId: garageId}
    });

    const insertOption = {
        rawResult: true
    }

    if (session) {
        insertOption.session = session;
    }

    console.log(insertOption);

    await Image.insertMany(imagesInst, insertOption);

    console.log('Insert successfully');

    return imagesId;
}

export const convertSingleImageToMultipleSizes = (imagesPath) => {
  const imagesInst = TOTAL_IMAGE_SIZE.map((size) => {
    const pathImage = convertUrlPathWithSize(imagesPath, size.width, size.height);
    return {url: pathImage, width: size.width, height: size.height};
  })

  console.log(imagesInst);

  return imagesInst;
}

export const saveMultipleImageWithSizeMongoose = async (imagesPath, session, garageId, isUploadLocal = false) => {
  try {
    console.log(imagesPath);
    const imagesId = [];
    const imagesInst = [];
    
    imagesPath.forEach((image) => {
      TOTAL_IMAGE_SIZE.forEach((size) => {
        const mongoId = new Types.ObjectId();
        imagesId.push(mongoId);
        const pathImage = !isUploadLocal ? convertUrlPathWithSize(image, size.width, size.height) : image;

        imagesInst.push({_id: mongoId, url: pathImage, garageId: mongoose.Types.ObjectId(garageId), width: size.width, height: size.height})
      })
    })

    const insertOption = {
        rawResult: true
    }

    if (session) {
        insertOption.session = session;
    }

    console.log(imagesInst);

    // bulk write
    const bulkOps = imagesInst.map(el => ({
      insertOne: {
        document: el
      }
    }));

    const collection = dbNative.collection('images');

    await collection.bulkWrite(bulkOps);

    // await Image.insertMany(imagesInst, insertOption);

    console.log('Insert successfully');

    return imagesId;
  } catch (error) {
    throw new Error(error);
  }
}

export const saveSingleImageLocalBase64 = async (ipAddress, bufferData, index) => {
    const publicPath = path.join(process.cwd(), 'public');
    const uploadPath = path.join(publicPath, 'images');

    // convert webp
    const webpData = await sharp(Buffer.from(bufferData, 'base64'))
            .webp()
            .toBuffer();

    const timestamp = new Date().getTime();
    const filename = `garageImg-${ipAddress.replace('::', '')}-${timestamp}${index || index === 0 ? `-${index}` : ''}.webp`;

    console.log(filename)

    // uploading image to server
    fs.writeFileSync(path.join(uploadPath, filename), webpData);

    return `${process.env.DEV_PUBLIC_URL}/${process.env.DEV_BACKUP_IMAGE_FOLDER}/${filename}`;
}

export const saveMultipleImagesLocalBase64 = async (ipAddress, bufferDataArr) => {
    const imagesUploadingPromise = bufferDataArr.map(async (base64Image, index) => {
        const data = await saveSingleImageLocalBase64(ipAddress, base64Image, index)
        return data;
    })

    const data = await Promise.all(imagesUploadingPromise);

    return data;
}

// resize image by url
export const convertUrlPathWithSize = (urlStr, width = HOME_IMAGE_SIZE.width, height = HOME_IMAGE_SIZE.height) => {
    const splitedPath = removeDimensionsFromURL(urlStr).split('upload');

    return convertToWebp(`${splitedPath[0]}upload/w_${width},h_${height}${splitedPath[1]}`);
}

// resize image by url
export const convertUrlPathObjectWithSize = (urlStr, width = HOME_IMAGE_SIZE.width, height = HOME_IMAGE_SIZE.height) => {
  const splitedPath = urlStr.split('upload');

  return {
    url: convertToWebp(`${splitedPath[0]}upload/w_${width},h_${height}${splitedPath[1]}`),
    width: width,
    height: height
  };
}

// resize image by url return object
export const convertMultipleUrlPathWithSize = (garageArr = [], width = HOME_IMAGE_SIZE.width, height = HOME_IMAGE_SIZE.height) => {
  
  const returnData = garageArr.map(garage => {
    garage.images = garage.images.map(img => {
        return {
          url: convertUrlPathWithSize(img.url),
          width,
          height
        } 
    })
    return garage;
})

  console.log(returnData);

  return returnData;
}

export const convertToWebp = (imageUrl) => {
    const splitUrlPart = imageUrl.split('.');

    if(ALLOW_IMAGE_FORMAT.includes(splitUrlPart[splitUrlPart.length - 1])) {
        splitUrlPart[splitUrlPart.length - 1] = 'webp';
        
        return splitUrlPart.join('.');
    }

    return imageUrl
}

export const deleteFileInfolder = (imagePathToDelete) => {
    const publicPath = path.join(process.cwd(), 'public');
    const splitedImagePath = path.join(publicPath, imagePathToDelete.split(`${process.env.DEV_PUBLIC_URL}/`)[1]);

    fs.unlink(splitedImagePath, (err) => {
        if (err) {
          console.error(`Error deleting image: ${err.message}`);
        } else {
          console.log(`Image deleted successfully: ${imagePathToDelete}`);
        }
      });
}

export const deleteMultipleFileInFolder = (imagePathsToDelete = []) => {
    imagePathsToDelete.forEach(image => {
        deleteFileInfolder(image)
    })
}

export const getImagesDevPublicUrlIncluded = async (garageId) => {
    const pipeline = [
        {
          $match: {
            garageId: new Types.ObjectId(garageId)
          }
        },
        {
          $match: {
            path: new RegExp(process.env.DEV_PUBLIC_URL, 'i')
          }
        }
    ];

    const retrieveImagesMongoose = await Image.aggregate(pipeline);

    const filterPaths = retrieveImagesMongoose.map(image => image.path);

    return filterPaths;
}

export const getImagesDevPublicUrlIncludedAndDeleted = async (garageId) => {
    try {
        const pipeline = [
            {
              $match: {
                garageId: new Types.ObjectId(garageId)
              }
            },
            {
              $match: {
                path: new RegExp(process.env.DEV_PUBLIC_URL, 'i')
              }
            }
        ];
    
        const retrieveImagesMongoose = await Image.aggregate(pipeline);
    
        const imageIds = retrieveImagesMongoose.map(image => image._id);
    
        await Image.deleteMany({ _id: { $in: imageIds } });
        
    } catch (error) {
        console.log('Delete failed with error: ', error);
    }
}

function removeDimensionsFromURL(url) {
  console.log(url)
  // Define the pattern to match "w_{number},h_{number}"
  var pattern = /w_\d+,h_\d+/;

  // Use replace() to remove the matched pattern from the URL
  var cleanedURL = url.replace(pattern, '');

  return cleanedURL;
}