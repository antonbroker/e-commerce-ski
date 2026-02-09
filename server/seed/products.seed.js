/**
 * Seed script: copy categories and products from LOCAL MongoDB to PRODUCTION MongoDB.
 *
 * Usage:
 *   cd server
 *   set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce?...
 *   node seed/products.seed.js
 *
 * Optional: LOCAL_MONGODB_URI (default: mongodb://localhost:27017/ecommerce)
 * Required: MONGODB_URI = production database where data will be written
 *
 * Local MongoDB must be running. Production DB collections "categories" and "products"
 * will be cleared and filled with data from local. "users" are not touched.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
const PROD_URI = process.env.MONGODB_URI;

async function run() {
  if (!PROD_URI) {
    console.error('❌ Set MONGODB_URI (production database).');
    process.exit(1);
  }

  let categories = [];
  let products = [];

  // 1. Read from local
  try {
    await mongoose.connect(LOCAL_URI);
    console.log('✅ Connected to LOCAL:', mongoose.connection.name);
    categories = await Category.find({}).lean();
    products = await Product.find({}).lean();
    console.log('   Categories:', categories.length, '| Products:', products.length);
  } catch (err) {
    console.error('❌ Local DB error:', err.message);
    console.error('   Is MongoDB running? Default URI:', LOCAL_URI);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('   Disconnected from local.');
  }

  if (!categories.length && !products.length) {
    console.error('❌ No categories or products in local DB.');
    process.exit(1);
  }

  // Normalize product data for schema (e.g. gender enum)
  products = products.map((p) => {
    const out = { ...p };
    if (out.gender === 'women') out.gender = 'woman';
    return out;
  });

  // 2. Write to production
  try {
    await mongoose.connect(PROD_URI);
    console.log('✅ Connected to PRODUCTION:', mongoose.connection.name);

    if (categories.length) {
      await Category.deleteMany({});
      await Category.insertMany(categories);
      console.log('✅ Categories seeded:', categories.length);
    }
    if (products.length) {
      await Product.deleteMany({});
      await Product.insertMany(products);
      console.log('✅ Products seeded:', products.length);
    }

    console.log('✅ Seed done.');
  } catch (err) {
    console.error('❌ Production DB error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('   Disconnected from production.');
    process.exit(0);
  }
}

run();
