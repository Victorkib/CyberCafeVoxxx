import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendAbandonedCartEmail } from '../utils/email.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price salePrice images stock status'
  );

  if (!cart) {
    // Create a new cart if one doesn't exist
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalAmount: 0,
      status: 'active'
    });
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    res.status(400);
    throw new Error('Please provide a valid product ID and quantity');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // Create new cart if it doesn't exist
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalAmount: 0,
      status: 'active'
    });
  }

  try {
    // Use the cart model's addItem method
    await cart.addItem(productId, quantity);
    
    // Populate product details for response
    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price salePrice images stock status'
    );

    res.json(updatedCart);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  try {
    // Use the cart model's removeItem method
    await cart.removeItem(req.params.productId);
    
    // Populate product details for response
    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price salePrice images stock status'
    );

    res.json(updatedCart);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Please provide a valid quantity');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  try {
    // Use the cart model's updateItemQuantity method
    await cart.updateItemQuantity(productId, quantity);
    
    // Populate product details for response
    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price salePrice images stock status'
    );

    res.json(updatedCart);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  try {
    // Use the cart model's clear method
    await cart.clear();
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Check for abandoned carts and send reminders
// @route   POST /api/cart/check-abandoned
// @access  Private/Admin
export const checkAbandonedCarts = asyncHandler(async (req, res) => {
  const abandonedCarts = await Cart.find({
    items: { $ne: [] },
    status: 'active',
    lastUpdated: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
  }).populate('user', 'name email');

  let processedCount = 0;

  for (const cart of abandonedCarts) {
    if (cart.user && cart.items.length > 0) {
      try {
        // Mark cart as abandoned
        cart.status = 'abandoned';
        await cart.save();
        
        // Send email notification
        await sendAbandonedCartEmail(cart.user.email, cart);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process abandoned cart for ${cart.user.email}:`, error);
      }
    }
  }

  res.json({
    success: true,
    message: `Processed ${processedCount} abandoned carts`,
  });
});

// @desc    Get cart summary (count and total)
// @route   GET /api/cart/summary
// @access  Private
export const getCartSummary = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (!cart) {
    return res.json({ itemCount: 0, totalAmount: 0 });
  }
  
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  res.json({
    itemCount,
    totalAmount: cart.totalAmount
  });
});