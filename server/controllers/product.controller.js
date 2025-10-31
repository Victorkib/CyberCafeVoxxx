import Product from '../models/product.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createProductNotification } from '../utils/notificationHelper.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const sort = req.query.sort || 'createdAt';
  const order = req.query.order || 'desc';

  // Extract nested filter object
  const filterQuery = req.query.filter || {};

  // Build filter object from query params
  const filter = {};
  if (filterQuery.keyword) {
    filter.name = { $regex: filterQuery.keyword, $options: 'i' };
  }
  if (filterQuery.category) {
    filter.category = filterQuery.category;
  }
  if (filterQuery.status && filterQuery.status !== 'all') {
    filter.status = filterQuery.status;
  }

  // Price range filter
  if (filterQuery.minPrice || filterQuery.maxPrice) {
    filter.price = {};
    if (filterQuery.minPrice) filter.price.$gte = Number(filterQuery.minPrice);
    if (filterQuery.maxPrice) filter.price.$lte = Number(filterQuery.maxPrice);
  }

  // Stock range filter
  if (filterQuery.minStock || filterQuery.maxStock) {
    filter.stock = {};
    if (filterQuery.minStock) filter.stock.$gte = Number(filterQuery.minStock);
    if (filterQuery.maxStock) filter.stock.$lte = Number(filterQuery.maxStock);
  }

  // Tags filter (optional)
  if (filterQuery.tags) {
    const tags = Array.isArray(filterQuery.tags) ? filterQuery.tags : [filterQuery.tags];
    filter.tags = { $in: tags };
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .populate('category', 'name slug');

  res.json({
    products,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    category,
    stock,
    images,
    status,
    featured,
    isNewProduct,
    onSale,
    specifications,
    tags,
    sku
  } = req.body;

  // Improved status handling
  let statusValue;
  if (status === true || status === 'true') {
    statusValue = 'active';
  } else if (status === false || status === 'false') {
    statusValue = 'inactive';
  } else if (status === 'active' || status === 'inactive' || status === 'out_of_stock') {
    statusValue = status;
  } else {
    statusValue = 'active'; // Default value
  }

  const product = new Product({
    name,
    description,
    price,
    salePrice,
    category,
    stock,
    images: images || [],
    status: statusValue,
    featured: featured === true || featured === 'true' ? true : false,
    isNewProduct: isNewProduct === true || isNewProduct === 'true' ? true : false,
    onSale: onSale === true || onSale === 'true' ? true : false,
    specifications: specifications || {},
    tags: tags || [],
    sku: sku || generateSKU(name, category)
  });

  const createdProduct = await product.save();

  if (req.user) {
    await createProductNotification({
      userId: req.user._id,
      productId: createdProduct._id,
      action: 'create',
      details: `New product "${createdProduct.name}" has been added`
    });
  }

  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    salePrice,
    category,
    stock,
    images,
    status,
    featured,
    isNewProduct,
    onSale,
    specifications,
    tags,
    sku
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Improved status handling
    let statusValue;
    if (status === true || status === 'true') {
      statusValue = 'active';
    } else if (status === false || status === 'false') {
      statusValue = 'inactive';
    } else if (status === 'active' || status === 'inactive' || status === 'out_of_stock') {
      statusValue = status;
    } else if (status !== undefined) {
      statusValue = status; // Keep as is if it's a valid string
    } else {
      statusValue = product.status; // Keep existing value if not provided
    }

    // Update product fields
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    product.images = images !== undefined ? images : product.images;
    product.status = statusValue;
    
    // Handle boolean fields consistently
    product.featured = featured === true || featured === 'true' ? true : 
                       featured === false || featured === 'false' ? false : 
                       featured !== undefined ? featured : product.featured;
                       
    product.isNewProduct = isNewProduct === true || isNewProduct === 'true' ? true : 
                          isNewProduct === false || isNewProduct === 'false' ? false : 
                          isNewProduct !== undefined ? isNewProduct : product.isNewProduct;
                          
    product.onSale = onSale === true || onSale === 'true' ? true : 
                    onSale === false || onSale === 'false' ? false : 
                    onSale !== undefined ? onSale : product.onSale;
                    
    product.specifications = specifications !== undefined ? specifications : product.specifications;
    product.tags = tags !== undefined ? tags : product.tags;
    product.sku = sku !== undefined ? sku : product.sku;

    const updatedProduct = await product.save();

    if (req.user) {
      await createProductNotification({
        userId: req.user._id,
        productId: updatedProduct._id,
        action: 'update',
        details: `Product "${updatedProduct.name}" has been updated`
      });
    }

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed', _id: req.params.id });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
export const updateProductStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.status = status || product.status;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
// @access  Private/Admin
export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  
  if (!productIds || !Array.isArray(productIds)) {
    res.status(400);
    throw new Error('Product IDs must be provided as an array');
  }

  const result = await Product.deleteMany({ _id: { $in: productIds } });
  
  res.json({ 
    message: `${result.deletedCount} products deleted successfully`,
    deletedCount: result.deletedCount,
    productIds
  });
});

// @desc    Bulk update product status
// @route   POST /api/products/bulk-update-status
// @access  Private/Admin
export const bulkUpdateProductStatus = asyncHandler(async (req, res) => {
  const { ids, status, ...otherUpdates } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    res.status(400);
    throw new Error('Product IDs must be provided as an array');
  }

  const updateData = { status };
  
  // Add any other fields that need to be updated
  Object.keys(otherUpdates).forEach(key => {
    if (otherUpdates[key] !== undefined) {
      updateData[key] = otherUpdates[key];
    }
  });

  const result = await Product.updateMany(
    { _id: { $in: ids } },
    { $set: updateData }
  );
  
  // Get the updated products to return
  const updatedProducts = await Product.find({ _id: { $in: ids } });
  
  res.json({ 
    message: `${result.modifiedCount} products updated successfully`,
    modifiedCount: result.modifiedCount,
    updatedProducts
  });
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isNewProduct: true })
    .sort({ createdAt: -1 })
    .limit(8);
  res.json(products);
});

// @desc    Get sale products
// @route   GET /api/products/sale
// @access  Public
export const getSaleProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ onSale: true })
    .sort({ createdAt: -1 })
    .limit(8);
  res.json(products);
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id }
  })
    .limit(4);
  
  res.json(relatedProducts);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    // First try to get featured products
    let products = await Product.find({ featured: true, status: 'active' })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8);
    
    // If no featured products, get recent products
    if (products.length === 0) {
      products = await Product.find({ status: 'active' })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(8);
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.json([]); // Return empty array instead of error
  }
});

// Helper function to generate SKU
const generateSKU = (name, categoryId) => {
  const namePrefix = name ? name.substring(0, 3).toUpperCase() : 'PRD';
  const catPrefix = categoryId ? categoryId.toString().substring(0, 3).toUpperCase() : 'CAT';
  const randomNum = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${namePrefix}-${catPrefix}-${randomNum}`;
};