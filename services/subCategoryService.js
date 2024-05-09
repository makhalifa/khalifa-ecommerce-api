const slugify = require('slugify');
const asyncHadler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const SubCategory = require('../models/subCategoryModel');

// Middleware to set category id to body
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc    Create new sub-category
// @route   POST /api/v1/subcategories
// @access  Private
exports.createSubCategory = asyncHadler(async (req, res) => {
  const { name, category } = req.body;

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category,
  });
  res.status(201).json({ data: subCategory });
});

exports.createFilterObj = (req, res, next) => {
  const filterObject = {};

  if (req.params.categoryId) filterObject.category = req.params.categoryId;

  next();
};

// @desc    Get all sub-categories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  // 2 query => 1. get all subCategories 2. get category name
  const subCategories = await SubCategory.find(req.filterObject)
    .skip(skip)
    .limit(limit);
  // .populate({
  //   path: 'category',
  //   select: 'name -_id',
  // });

  res
    .status(200)
    .json({ results: subCategories.length, page, data: subCategories });
};

// @desc    Get specific sub-category by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);
  // .populate({
  //   path: 'category',
  //   select: 'name -_id',
  // });
  if (!subCategory) {
    return next(new ApiError(404, `No subCategory for this id ${id}`));
  }
  res.status(200).json({ data: subCategory });
});

// @desc    Update sub-category by id
// @route   PUT /api/v1/subcategories/:id
// @access  Private
exports.updateSubCategory = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const subCategory = await SubCategory.findOneAndUpdate(
    { _id: id },
    { name, slug: slugify(name), category },
    { new: true } // return updated data
  );

  if (!subCategory) {
    return next(new ApiError(404, `No subCategory for this id ${id}`));
  }
  res.status(200).json({ data: subCategory });
});

// @desc    Delete sub-category by id
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubCategory = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findByIdAndDelete(id);
  if (!subCategory) {
    return next(new ApiError(404, `No subCategory for this id ${id}`));
  }
  res.status(204).json({ msg: 'subCategory deleted successfully ✅✅✅' });
});