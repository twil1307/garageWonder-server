import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();


// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryInst = cloudinary;

// Create the Multer storage engine using the CloudinaryStorage
export const storageUser = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "User", // User folder to store the files in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Optional array of allowed file formats
  },
});

export const storeGarage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Garage", // Hotel folder to store the files in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"], // Optional array of allowed file formats
    // transformation: [{ width: 800, height: 600}],
  },
});

const storageGarageLocal = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/garages");
  },
  filename: function (req, file, cb) {
    const fileExtension = getFileExtension(file.originalname);
    cb(
      null,
      `${file.fieldname}-${Date.now()}.${fileExtension}`
    );
  },
});

// Helper function to get file extension
function getFileExtension(filename) {
  return filename.split(".").pop();
}

// upload to online cloud
export const userImageUploader = multer({ storage: storageUser });
export const garageImageUploader = multer({ storage: storeGarage });

// upload local
export const garageImageUploaderLocal = multer({ storage: storageGarageLocal });
export const formDataRetrieve = multer();
