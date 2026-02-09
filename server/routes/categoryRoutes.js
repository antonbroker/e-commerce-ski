const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const authMiddleware = require('../middleware/auth')
const isAdminMiddleware = require('../middleware/isAdmin')

/**
 * Category Routes - routes for categories
 * 
 * All routes start with /api/categories (connected in server.js)
 * 
 * Routes:
 * - GET /api/categories - get all categories (public, for filters)
 * - GET /api/categories/:id - get category by ID (public)
 * - POST /api/categories - create category (admin only)
 * - PUT /api/categories/:id - update category (admin only)
 * - DELETE /api/categories/:id - delete category (admin only)
 */

/**
 * GET /api/categories
 * Get all categories
 * Public route - needed for product filters
 */
router.get('/', categoryController.getAllCategoriesController)

/**
 * GET /api/categories/:id
 * Get category by ID
 * Public route
 */
router.get('/:id', categoryController.getCategoryByIdController)

/**
 * POST /api/categories
 * Create new category
 * Protected route - admin only
 */
router.post('/', authMiddleware, isAdminMiddleware, categoryController.createCategoryController)

/**
 * PUT /api/categories/:id
 * Update category
 * Protected route - admin only
 */
router.put('/:id', authMiddleware, isAdminMiddleware, categoryController.updateCategoryController)

/**
 * DELETE /api/categories/:id
 * Delete category
 * Protected route - admin only
 */
router.delete('/:id', authMiddleware, isAdminMiddleware, categoryController.deleteCategoryController)

module.exports = router
