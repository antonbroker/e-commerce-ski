const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const authMiddleware = require('../middleware/auth')
const isAdminMiddleware = require('../middleware/isAdmin')

/**
 * Product Routes - routes for products
 * 
 * All routes start with /api/products (connected in server.js)
 * 
 * Routes:
 * - GET /api/products - get all products (public, for catalog)
 * - GET /api/products/:id - get product by ID (public)
 * - GET /api/products/category/:categoryId - get products by category (public, for filters)
 * - POST /api/products - create product (admin only)
 * - PUT /api/products/:id - update product (admin only)
 * - DELETE /api/products/:id - delete product (admin only)
 */

/**
 * GET /api/products/filters/options
 * Get filter options (unique brands, colors)
 * Public route - needed for catalog filters
 * IMPORTANT: This route must be BEFORE /api/products/:id to avoid conflict
 */
router.get('/filters/options', productController.getFilterOptionsController)

/**
 * GET /api/products/category/:categoryId
 * Get products by category
 * Public route - needed for product filters
 * IMPORTANT: This route must be BEFORE /api/products/:id to avoid conflict
 */
router.get('/category/:categoryId', productController.getProductsByCategoryController)

/**
 * GET /api/products/:id
 * Get product by ID
 * Public route
 */
router.get('/:id', productController.getProductByIdController)

/**
 * GET /api/products
 * Get all products
 * Public route - needed for product catalog
 */
router.get('/', productController.getAllProductsController)

/**
 * POST /api/products
 * Create new product
 * Protected route - admin only
 */
router.post('/', authMiddleware, isAdminMiddleware, productController.createProductController)

/**
 * PUT /api/products/:id
 * Update product
 * Protected route - admin only
 */
router.put('/:id', authMiddleware, isAdminMiddleware, productController.updateProductController)

/**
 * DELETE /api/products/:id
 * Delete product
 * Protected route - admin only
 */
router.delete('/:id', authMiddleware, isAdminMiddleware, productController.deleteProductController)

module.exports = router
