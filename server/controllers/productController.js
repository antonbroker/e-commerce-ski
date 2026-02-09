const productService = require('../services/productService')

/**
 * Product Controller - handling HTTP requests for products
 * 
 * Responsible for:
 * - Getting data from req.body, req.params, req.query
 * - Calling productService
 * - Returning response (res.json)
 * - Handling errors
 */

/**
 * Get all products with optional filters
 * GET /api/products
 * Query params: ?category=123&gender=men&minPrice=100&maxPrice=500&search=phone&minLength=150&maxLength=180&brand=Rossignol&color=Black
 */
const getAllProductsController = async (req, res) => {
  try {
    // req.query contains all query parameters from the URL
    // For example: GET /api/products?category=123&minPrice=100
    // req.query = { category: "123", minPrice: "100" }
    
    const filters = {
      category: req.query.category,        // Category ID
      minPrice: req.query.minPrice,        // Minimum price
      maxPrice: req.query.maxPrice,        // Maximum price
      search: req.query.search,            // Search by title
      gender: req.query.gender,            // Filter by gender (men, woman, all)
      minLength: req.query.minLength,      // Minimum length (for skis, etc.)
      maxLength: req.query.maxLength,      // Maximum length (for skis, etc.)
      size: req.query.size,                // Filter by size (for boots)
      brand: req.query.brand,              // Filter by brand
      color: req.query.color,              // Filter by color
      sort: req.query.sort                 // Sort order (newest, price-asc, price-desc, name)
    }

    // Pass filters to service
    // Service will build MongoDB query based on these filters
    const products = await productService.getAllProducts(filters)
    
    res.status(200).json({products})

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const product = await productService.getProductById(id)
    
    res.status(200).json({product})

  } catch (error) {
    const statusCode = error.message === 'Product not found' ? 404 : 500
    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Get products by category
 * GET /api/products/category/:categoryId
 */
const getProductsByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params
    const products = await productService.getProductsByCategory(categoryId)
    
    res.status(200).json({products})

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

/**
 * Create new product
 * POST /api/products
 * Body: { title, price, category, imageUrl, stock }
 */
const createProductController = async (req, res) => {
  try {
    const { title, price, category, imageUrl, stock, gender, length, size, brand, color } = req.body

    // Validation
    if (!title || !price || !category || !imageUrl) {
      return res.status(400).json({
        error: 'All fields are required: title, price, category, imageUrl'
      })
    }

    const product = await productService.createProduct({
      title,
      price,
      category,
      imageUrl,
      stock,
      gender,
      length,
      size,
      brand,
      color
    })

    res.status(201).json({
      message: 'Product created successfully',
      product
    })

  } catch (error) {
    let statusCode = 400
    if (error.message === 'Category not found') {
      statusCode = 404
    }

    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Update product
 * PUT /api/products/:id
 * Body: { title?, price?, category?, imageUrl?, stock? }
 */
const updateProductController = async (req, res) => {
  try {
    const { id } = req.params
    const { title, price, category, imageUrl, stock, gender, length, size, brand, color } = req.body

    const product = await productService.updateProduct(id, {
      title,
      price,
      category,
      imageUrl,
      stock,
      gender,
      length,
      size,
      brand,
      color
    })

    res.status(200).json({
      message: 'Product updated successfully',
      product
    })

  } catch (error) {
    let statusCode = 500
    if (error.message === 'Product not found' || error.message === 'Category not found') {
      statusCode = 404
    } else if (error.message.includes('cannot be negative') || error.message.includes('required')) {
      statusCode = 400
    }

    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Delete product
 * DELETE /api/products/:id
 */
const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params
    await productService.deleteProduct(id)

    res.status(200).json({
      message: 'Product deleted successfully'
    })

  } catch (error) {
    const statusCode = error.message === 'Product not found' ? 404 : 500
    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Get filter options (brands, colors)
 * GET /api/products/filters/options
 */
const getFilterOptionsController = async (req, res) => {
  try {
    const options = await productService.getFilterOptions()
    
    res.status(200).json(options)

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

module.exports = { getAllProductsController, getProductByIdController, getProductsByCategoryController, createProductController, updateProductController, deleteProductController, getFilterOptionsController }
