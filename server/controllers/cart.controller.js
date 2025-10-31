import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { sendAbandonedCartEmail } from '../utils/email.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name price images countInStock salePrice'
  );

  if (cart) {
    res.json(cart);
  } else {
    res.json({ items: [], totalAmount: 0 });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  const itemPrice = product.salePrice || product.price;

  if (cart) {
    // Cart exists, check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * itemPrice;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        price: itemPrice,
        totalPrice: quantity * itemPrice
      });
    }

    await cart.save();
  } else {
    // Create new cart
    cart = await Cart.create({
      user: req.user._id,
      items: [{
        product: productId,
        quantity,
        price: itemPrice,
        totalPrice: quantity * itemPrice
      }],
    });
  }

  const updatedCart = await Cart.findById(cart._id).populate(
    'items.product',
    'name price images countInStock salePrice'
  );

  res.json(updatedCart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      'items.product',
      'name price images countInStock salePrice'
    );

    res.json(updatedCart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Check for abandoned carts and send reminders
// @route   POST /api/cart/check-abandoned
// @access  Private/Admin
export const checkAbandonedCarts = asyncHandler(async (req, res) => {
  const abandonedCarts = await Cart.find({
    items: { $ne: [] },
    updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours ago
  }).populate('user', 'name email');

  for (const cart of abandonedCarts) {
    if (cart.user && cart.items.length > 0) {
      try {
        await sendAbandonedCartEmail(cart.user.email, cart);
      } catch (error) {
        console.error(`Failed to send abandoned cart email to ${cart.user.email}:`, error);
      }
    }
  }

  res.json({
    success: true,
    message: `Processed ${abandonedCarts.length} abandoned carts`,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error('Not enough stock');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const itemPrice = product.salePrice || product.price;
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = itemPrice;
    cart.items[itemIndex].totalPrice = quantity * itemPrice;
  }

  await cart.save();

  const updatedCart = await Cart.findById(cart._id).populate(
    'items.product',
    'name price images countInStock salePrice'
  );

  res.json(updatedCart);
}); 