import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.model.js';
import Product from '../models/product.model.js';

dotenv.config();

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
  },
  {
    name: 'Storage',
    description: 'Storage devices and solutions',
    image: '/PortableSSD.jpg',
    featured: false,
    status: 'active'
  },
  {
    name: 'Audio',
    description: 'Audio equipment and accessories',
    image: '/earbuds.jpg',
    featured: false,
    status: 'active'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    // Create some sample products
    const products = [
      {
        name: 'Gaming Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with customizable keys perfect for gaming',
        price: 89.99,
        salePrice: 69.99,
        images: ['/keyboard.jpg'],
        category: createdCategories.find(cat => cat.name === 'Peripherals')._id,
        stock: 25,
        featured: true,
        isNewProduct: false,
        onSale: true,
        rating: 4.7,
        numReviews: 128,
        specifications: new Map([
          ['brand', 'VoxTech'],
          ['switchType', 'Blue'],
          ['connectivity', 'Wired'],
          ['backlight', 'RGB']
        ]),
        tags: ['gaming', 'keyboard', 'mechanical', 'rgb'],
        status: 'active',
        sku: 'KB-MECH-001'
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'Ultra-responsive wireless mouse with RGB lighting and precision tracking',
        price: 59.99,
        salePrice: 49.99,
        images: ['/mouse.jpg'],
        category: createdCategories.find(cat => cat.name === 'Peripherals')._id,
        stock: 42,
        featured: true,
        isNewProduct: false,
        onSale: true,
        rating: 4.5,
        numReviews: 94,
        specifications: new Map([
          ['brand', 'VoxTech'],
          ['dpi', '16000'],
          ['connectivity', 'Wireless'],
          ['batteryLife', '70 hours']
        ]),
        tags: ['gaming', 'mouse', 'wireless', 'rgb'],
        status: 'active',
        sku: 'MS-WRLS-001'
      },
      {
        name: 'Gaming Monitor 27"',
        description: '27-inch 144Hz gaming monitor with 1ms response time for competitive gaming',
        price: 249.99,
        salePrice: 219.99,
        images: ['/GamingMonitor.avif'],
        category: createdCategories.find(cat => cat.name === 'Electronics')._id,
        stock: 10,
        featured: true,
        isNewProduct: false,
        onSale: true,
        rating: 4.9,
        numReviews: 87,
        specifications: new Map([
          ['size', '27 inch'],
          ['resolution', '1920x1080'],
          ['refreshRate', '144Hz'],
          ['responseTime', '1ms']
        ]),
        tags: ['gaming', 'monitor', 'display', 'high-refresh'],
        status: 'active',
        sku: 'MN-GAME-001'
      },
      {
        name: 'Wi-Fi 6 Router',
        description: 'High-speed Wi-Fi 6 router for ultimate gaming and streaming performance',
        price: 179.99,
        salePrice: 149.99,
        images: ['/Wi-Fi6Router.webp'],
        category: createdCategories.find(cat => cat.name === 'Networking')._id,
        stock: 15,
        featured: true,
        isNewProduct: true,
        onSale: true,
        rating: 4.6,
        numReviews: 62,
        specifications: new Map([
          ['standard', 'Wi-Fi 6'],
          ['speed', '3000 Mbps'],
          ['ports', '4 Gigabit LAN'],
          ['antennas', '4']
        ]),
        tags: ['networking', 'router', 'wifi', 'high-speed'],
        status: 'active',
        sku: 'RT-WIFI6-001'
      },
      {
        name: 'Portable SSD 1TB',
        description: '1TB portable SSD with USB-C connectivity for fast data transfer',
        price: 149.99,
        salePrice: 129.99,
        images: ['/PortableSSD.jpg'],
        category: createdCategories.find(cat => cat.name === 'Storage')._id,
        stock: 22,
        featured: true,
        isNewProduct: false,
        onSale: true,
        rating: 4.7,
        numReviews: 75,
        specifications: new Map([
          ['capacity', '1TB'],
          ['interface', 'USB-C'],
          ['speed', '1050 MB/s'],
          ['dimensions', '95x50x10mm']
        ]),
        tags: ['storage', 'ssd', 'portable', 'usb-c'],
        status: 'active',
        sku: 'SSD-PORT-001'
      },
      {
        name: 'Wireless Earbuds',
        description: 'True wireless earbuds with active noise cancellation and premium sound',
        price: 129.99,
        salePrice: 109.99,
        images: ['/earbuds.jpg'],
        category: createdCategories.find(cat => cat.name === 'Audio')._id,
        stock: 30,
        featured: false,
        isNewProduct: false,
        onSale: true,
        rating: 4.4,
        numReviews: 103,
        specifications: new Map([
          ['batteryLife', '8 hours'],
          ['connectivity', 'Bluetooth 5.2'],
          ['noiseCancel', 'Active'],
          ['waterproof', 'IPX5']
        ]),
        tags: ['audio', 'earbuds', 'wireless', 'bluetooth'],
        status: 'active',
        sku: 'EB-WRLS-001'
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded successfully');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();