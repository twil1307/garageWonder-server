import catchAsync from '../utils/catchAsync.js';
import dataResponse from '../utils/dataResponse.js';
import Brand from '../models/brand.model.js';


export const getAllBrands = catchAsync(async (_, res) => {
    const listBrands = await Brand.find({});

    return res.status(200).json(dataResponse(listBrands))
})

export const createNewBrand = catchAsync(async (req, res) => {
    const newBrand = new Brand(req.body);

    const brandData = await newBrand.save();

    return res.status(200).json(dataResponse(brandData, 200));
})