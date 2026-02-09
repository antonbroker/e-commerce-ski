const productRepository = require('../repositories/productRepository')
const categoryRepository = require('../repositories/categoryRepository')

/**
 * Product Service - business logic for products
 * 
 * Responsible for:
 * - Getting all products
 * - Creating products
 * - Updating products
 * - Deleting products
 * - Validating product data
 * - Checking category existence
 */

/**
 * Get all products with optional filters - { category?, minPrice?, maxPrice?, search? }
 */
const getAllProducts = async (filters = {}) => {
  // Build MongoDB filter based on passed parameters
  const mongoFilter = {}

  // 1. Filter by category
  // If category ID is passed, add it to the filter
  if (filters.category) {
    mongoFilter.category = filters.category
  }

  // 2. Filter by price (from minimum to maximum)
  // If minPrice or maxPrice is passed, create an object with conditions
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    mongoFilter.price = {}
    
    // $gte = greater than or equal (>=)
    if (filters.minPrice !== undefined) {
      mongoFilter.price.$gte = Number(filters.minPrice)
    }
    
    // $lte = less than or equal (<=)
    if (filters.maxPrice !== undefined) {
      mongoFilter.price.$lte = Number(filters.maxPrice)
    }
  }

  // 3. Search by title (title)
  // If search is passed, search for products whose title contains this text
  if (filters.search) {
    // $regex - search by regular expression
    // $options: 'i' - ignore case (case insensitive)
    mongoFilter.title = {
      $regex: filters.search,
      $options: 'i'
    }
  }

  // 4. Filter by gender
  // Valid values: 'men', 'woman'. If 'woman', also match legacy 'women'.
  if (filters.gender && filters.gender !== 'all') {
    mongoFilter.gender = filters.gender === 'woman'
      ? { $in: ['woman', 'women'] }
      : filters.gender
  }

  // 5. Filter by length (for skis, etc.)
  if (filters.minLength !== undefined || filters.maxLength !== undefined) {
    mongoFilter.length = {}
    if (filters.minLength !== undefined) mongoFilter.length.$gte = Number(filters.minLength)
    if (filters.maxLength !== undefined) mongoFilter.length.$lte = Number(filters.maxLength)
  }

  // 5b. Filter by size (for boots)
  if (filters.size && filters.size.trim()) {
    mongoFilter.size = { $regex: new RegExp(`^${filters.size.trim()}$`), $options: 'i' }
  }

  // 6. Filter by brand (supports comma-separated for multi-select)
  if (filters.brand && filters.brand !== 'all') {
    const brands = filters.brand.split(',').map(b => b.trim())
    if (brands.length === 1) {
      mongoFilter.brand = {
        $regex: brands[0],
        $options: 'i'
      }
    } else {
      // $in with case-insensitive regex for each brand
      mongoFilter.brand = {
        $in: brands.map(b => new RegExp(b, 'i'))
      }
    }
  }

  // 7. Filter by color (supports comma-separated for multi-select)
  if (filters.color && filters.color !== 'all') {
    const colors = filters.color.split(',').map(c => c.trim())
    if (colors.length === 1) {
      mongoFilter.color = {
        $regex: colors[0],
        $options: 'i'
      }
    } else {
      mongoFilter.color = {
        $in: colors.map(c => new RegExp(c, 'i'))
      }
    }
  }

  // 8. Sorting
  // Convert sort parameter to MongoDB sort object
  let sortOption = { createdAt: -1 } // default: newest first
  
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        sortOption = { price: 1 }
        break
      case 'price-desc':
        sortOption = { price: -1 }
        break
      case 'name':
        sortOption = { title: 1 }
        break
      case 'newest':
      default:
        sortOption = { createdAt: -1 }
    }
  }

  // Pass filter and sort to repository
  return await productRepository.getAllProducts(mongoFilter, sortOption)
}

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const product = await productRepository.getProductById(productId)
  
  if (!product) {
    throw new Error('Product not found')
  }
  
  return product
}

/**
 * Get products by category
 */
const getProductsByCategory = async (categoryId) => {
  return await productRepository.getProductsByCategory(categoryId)
}

/**
 * Create new product
 */
const createProduct = async (productData) => {
  const { title, price, category, imageUrl, stock, gender, length, size, brand, color } = productData

  // 1. Validate required fields
  if (!title || !price || !category || !imageUrl) {
    throw new Error('All fields are required: title, price, category, imageUrl')
  }

  // 2. Validate price
  if (price < 0) {
    throw new Error('Price cannot be negative')
  }

  // 3. Validate stock
  if (stock !== undefined && stock < 0) {
    throw new Error('Stock cannot be negative')
  }

  // 4. Check if category exists
  const categoryExists = await categoryRepository.getCategoryById(category)
  if (!categoryExists) {
    throw new Error('Category not found')
  }

  // 5. Create product with all fields
  const productToCreate = {
    title: title.trim(),
    price: Number(price),
    category,
    imageUrl: imageUrl.trim(),
    stock: stock !== undefined ? Number(stock) : 0
  }

  // Add optional fields if provided
  if (gender) productToCreate.gender = gender
  if (length !== undefined && length !== '') productToCreate.length = Number(length)
  if (size !== undefined && size !== '') productToCreate.size = String(size).trim()
  if (brand) productToCreate.brand = brand.trim()
  if (color) productToCreate.color = color.trim()

  const product = await productRepository.createProduct(productToCreate)
  
  return product
}

/**
 * Update product
 */
const updateProduct = async (productId, productData) => {
  // 1. Check if product exists
  const product = await productRepository.getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }

  // 2. Validate price if provided
  if (productData.price !== undefined && productData.price < 0) {
    throw new Error('Price cannot be negative')
  }

  // 3. Validate stock if provided
  if (productData.stock !== undefined && productData.stock < 0) {
    throw new Error('Stock cannot be negative')
  }

  // 4. Check if category exists (if category is being updated)
  if (productData.category) {
    const categoryExists = await categoryRepository.getCategoryById(productData.category)
    if (!categoryExists) {
      throw new Error('Category not found')
    }
  }

  // 5. Prepare update data
  const updateData = {}
  if (productData.title) updateData.title = productData.title.trim()
  if (productData.price !== undefined) updateData.price = Number(productData.price)
  if (productData.category) updateData.category = productData.category
  if (productData.imageUrl) updateData.imageUrl = productData.imageUrl.trim()
  if (productData.stock !== undefined) updateData.stock = Number(productData.stock)
  
  // Optional fields (can be set to null to remove)
  if (productData.gender !== undefined) updateData.gender = productData.gender || null
  if (productData.length !== undefined) updateData.length = productData.length ? Number(productData.length) : null
  if (productData.size !== undefined) updateData.size = productData.size ? String(productData.size).trim() : null
  if (productData.brand !== undefined) updateData.brand = productData.brand ? productData.brand.trim() : null
  if (productData.color !== undefined) updateData.color = productData.color ? productData.color.trim() : null

  // 6. Update product
  const updatedProduct = await productRepository.updateProduct(productId, updateData)
  
  return updatedProduct
}

/**
 * Delete product
 */
const deleteProduct = async (productId) => {
  // 1. Check if product exists
  const product = await productRepository.getProductById(productId)
  if (!product) {
    throw new Error('Product not found')
  }

  // 2. Delete product
  const deletedProduct = await productRepository.deleteProduct(productId)
  
  return deletedProduct
}

/**
 * Get filter options (unique brands and colors)
 */
const getFilterOptions = async () => {
  return await productRepository.getFilterOptions()
}

module.exports = { getAllProducts, getProductById, getProductsByCategory, createProduct, updateProduct, deleteProduct, getFilterOptions }

