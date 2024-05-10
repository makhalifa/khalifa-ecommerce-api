const slugify = require('slugify');
const asyncHadler = require('express-async-handler');

const ApiError = require('../utils/apiError');
const Product = require('../models/productModel');

const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res) => {
  // Build query
  const countDocuments = await Product.countDocuments();
  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .paginate(countDocuments)
    .filter()
    .search()
    .limitFields()
    .sort();

  // execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const products = await mongooseQuery;

  res
    .status(200)
    .json({ results: products.length, paginationResult, data: products });
};

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate({
    path: 'category',
    select: 'name -_id',
  });
  if (!product) {
    return next(new ApiError(404, `No product for this id ${id}`));
  }
  res.status(200).json({ data: product });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private
exports.createProduct = asyncHadler(async (req, res) => {
  req.body.slug = slugify(req.body.title);
  const product = await Product.create(req.body);
  res.status(201).json({ data: product });
});

// @desc    Update product by id
// @route   PUT /api/v1/products/:id
// @access  Private
exports.updateProduct = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.title) req.body.slug = slugify(req.body.title);

  const product = await Product.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true } // return updated data
  );

  if (!product) {
    return next(new ApiError(404, `No product for this id ${id}`));
  }
  res.status(200).json({ data: product });
});

// @desc    Delete product by id
// @route   DELETE /api/v1/products/:id
// @access  Private
exports.deleteProduct = asyncHadler(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new ApiError(404, `No product for this id ${id}`));
  }
  res.status(204).send();
});
