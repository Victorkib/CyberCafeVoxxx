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

  // Check if there's enough stock for the requested quantity
  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  const existingItem = this.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    // Check if there's enough stock for the updated quantity
    if (product.stock < (existingItem.quantity + quantity)) {
      throw new Error(`Cannot add ${quantity} more items. Only ${product.stock} items available in stock`);
    }
    
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
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  this.items.splice(itemIndex, 1);
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

  // Check if there's enough stock for the requested quantity
  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} items available in stock`);
  }

  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }

  this.items[itemIndex].quantity = quantity;
  this.items[itemIndex].totalPrice = quantity * this.items[itemIndex].price;

  return this.save();
};

// Method to clear cart
cartSchema.methods.clear = function () {
  this.items = [];
  this.totalAmount = 0;
  return this.save();
};

// Method to check if cart has items
cartSchema.methods.hasItems = function() {
  return this.items.length > 0;
};

// Method to get item count
cartSchema.methods.getItemCount = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Method to mark cart as converted (after checkout)
cartSchema.methods.markAsConverted = function() {
  this.status = 'converted';
  return this.save();
};

export default mongoose.model('Cart', cartSchema);