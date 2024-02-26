import catchAsync from '../utils/catchAsync.js';
import Category from '../models/category.model.js';
import dataResponse from '../utils/dataResponse.js';


export const getAllCategories = catchAsync(async (_, res) => {
    const listCategory = await Category.find({});

    return res.status(200).json(dataResponse(listCategory))
})

export const getCategoryById = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json(dataResponse(null, 400, 'Uid or id required'));
    }

    const category = await Category.findById(id);

    return res.status(200).json(dataResponse(category));
});

export const getCategoryByMultipleIds = catchAsync(async (req, res) => {
    const { categoryIds } = req.body;

    if (!categoryIds || categoryIds.length <= 0) {
        return res.status(400).json(dataResponse(null, 400, 'Ids required'));
    }

    const category = await Category.find({
        _id: {
            $in: categoryIds
        }
    });

    return res.status(200).json(dataResponse(category));
});

export const createNewCategory = catchAsync(async (req, res) => {
    const newCategory = new Category(req.body);

    const categoryData = await newCategory.save();

    return res.status(200).json(dataResponse(categoryData, 200));
})