import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';

dotenv.config();

const checkAndSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if we have any categories
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`📊 Current data: ${categoryCount} categories, ${productCount} products`);

    if (categoryCount === 0) {
      console.log('🌱 No categories found, seeding database...');
      
      const categories = [
        {
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          image: '/Techsetup.jpg',
          featured: true,
          status: 'active'
        },
        {
          name: 'Gaming',
          description: 'Gaming equipment and accessories',
          image: '/GamingGearSpectacular.avif',
          featured: true,
          status: 'active'
        },
        {
          name: 'Networking',
          description: 'Network equipment and accessories',
          image: '/Wi-Fi6Router.webp',
          featured: true,
          status: 'active'
        },
        {
          name: 'Peripherals',
          description: 'Computer peripherals and accessories',
          image: '/keyboard.jpg',
          featured: true,
          status: 'active'
        }
      ];

      const createdCategories = await Category.insertMany(categories);
      console.log('✅ Categories created successfully');

      // Create some sample products
      const products = [
        {
          name: 'Gaming Mechanical Keyboard',
          description: 'RGB backlit mechanical keyboard with customizable keys perfect for gaming',
          price: 89.99,
          salePrice: 69.99,
          images: ['/keyboard.jpg'],
          category: createdCategories[3]._id, // Peripherals
          stock: 25,
          featured: true,
          onSale: true,
          status: 'active'
        },
        {
          name: 'Gaming Monitor 27"',
          description: '27-inch 144Hz gaming monitor with 1ms response time',
          price: 249.99,
          salePrice: 219.99,
          images: ['/GamingMonitor.avif'],
          category: createdCategories[0]._id, // Electronics
          stock: 10,
          featured: true,
          onSale: true,
          status: 'active'
        },
        {
          name: 'Wi-Fi 6 Router',
          description: 'High-speed Wi-Fi 6 router for ultimate performance',
          price: 179.99,
          salePrice: 149.99,
          images: ['/Wi-Fi6Router.webp'],
          category: createdCategories[2]._id, // Networking
          stock: 15,
          featured: true,
          onSale: true,
          status: 'active'
        }
      ];

      await Product.insertMany(products);
      console.log('✅ Products created successfully');
      console.log('🎉 Database seeded successfully!');
    } else {
      console.log('✅ Database already has data, no seeding needed');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAndSeed();