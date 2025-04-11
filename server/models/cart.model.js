import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'converted', 'abandoned'],
      default: 'active',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate totals
cartSchema.pre('save', function (next) {
  this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.lastUpdated = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function (productId, quantity) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.isInStock()) {
    throw new Error('Product is out of stock');
  }

  const existingItem = this.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.price;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price: product.salePrice || product.price,
      totalPrice: quantity * (product.salePrice || product.price),
    });
  }

  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId
  );
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function (productId, quantity) {
  const Product = mongoose.model('Product');
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.isInStock()) {
    throw new Error('Product is out of stock');
  }

  const item = this.items.find(
    (item) => item.product.toString() === productId
  );

  if (item) {
    item.quantity = quantity;
    item.totalPrice = item.quantity * item.price;
  }

  return this.save();
};

// Method to clear cart
cartSchema.methods.clear = function () {
  this.items = [];
  this.totalAmount = 0;
  return this.save();
};

export default mongoose.model('Cart', cartSchema); 