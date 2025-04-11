import Category from '../models/category.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { uploadSingle } from '../middleware/upload.middleware.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const category = new Category({
    name,
    description,
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.description = description || category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.remove();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res) => {
  // If there are no categories in the database, return an empty array
  const count = await Category.countDocuments();
  
  if (count === 0) {
    return res.json([]);
  }
  
  // Check if there are any featured categories
  const featuredCount = await Category.countDocuments({ featured: true });
  
  if (featuredCount === 0) {
    // If no featured categories, return all categories
    const categories = await Category.find({}).limit(8);
    return res.json(categories);
  }
  
  // Otherwise, return featured categories
  const categories = await Category.find({ featured: true });
  res.json(categories);
}); 