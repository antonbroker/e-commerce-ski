const Product = require('../models/Product')

/**
 * Product Repository - database layer for Product model
 * 
 * Only CRUD operations, no business logic!
 * Business logic → in Service layer
 */

// Get all products with category populated
// filters - object with filter conditions for MongoDB
// sortOption - object for MongoDB sort (e.g., { price: 1 } for ascending)
const getAllProducts = async (filters = {}, sortOption = { createdAt: -1 }) => {
  // Product.find(filters) - MongoDB will find all products that match the filters
  // If filters is empty {} - will return all products
  return await Product.find(filters).populate('category', 'name').sort(sortOption)
}

// Get product by id with category populated
const getProductById = async (id) => {
  return await Product.findById(id).populate('category', 'name')
}

// Get multiple products by IDs (for recommendations)
const getProductsByIds = async (ids) => {
  if (!ids || ids.length === 0) return []
  return await Product.find({ _id: { $in: ids } }).populate('category', 'name')
}

// Get products by category
const getProductsByCategory = async (categoryId) => {
  return await Product.find({ category: categoryId }).populate('category', 'name').sort({ createdAt: -1 })
}

// Create product
const createProduct = async (productData) => {
  try {
    const product = await Product.create(productData)
    return await Product.findById(product._id).populate('category', 'name')

  } catch (error) {
    throw error
  }
}

// Decrement stock by amount (e.g. when order is placed). Uses $inc for atomic update.
const decrementStock = async (id, amount) => {
  return await Product.findByIdAndUpdate(
    id,
    { $inc: { stock: -amount } },
    { new: true }
  )
}

// Update product
const updateProduct = async (id, updateData) => {
  const updated = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )

  if (updated) {
    return await Product.findById(id).populate('category', 'name')
  }

  return null
}

// Delete product
const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id)
}

// Get unique filter values (brands, colors, sizes)
const getFilterOptions = async () => {
  const brands = await Product.distinct('brand', {
    brand: { $exists: true, $ne: null, $ne: '' }
  })
  const colors = await Product.distinct('color', {
    color: { $exists: true, $ne: null, $ne: '' }
  })
  const sizes = await Product.distinct('size', {
    size: { $exists: true, $ne: null, $ne: '' }
  })
  return {
    brands: brands.sort(),
    colors: colors.sort(),
    sizes: sizes.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }))
  }
}

module.exports = { getAllProducts, getProductById, getProductsByIds, getProductsByCategory, createProduct, updateProduct, deleteProduct, decrementStock, getFilterOptions }
