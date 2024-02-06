import catchAsync from '../utils/catchAsync.js';
import Category from '../models/category.model.js';
import dataResponse from '../utils/dataResponse.js';


export const getAllCategories = catchAsync(async (_, res) => {
    const listCategory = await Category.find({});

    return res.status(200).json(dataResponse(listCategory))
})

export const createNewCategory = catchAsync(async (req, res) => {
    const newCategory = new Category(req.body);

    const categoryData = await newCategory.save();

    return res.status(200).json(dataResponse(categoryData, 200));
})