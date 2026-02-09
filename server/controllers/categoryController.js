const categoryService = require('../services/categoryService')

/**
 * Category Controller - handling HTTP requests for categories
 * 
 * Responsible for:
 * - Getting data from req.body, req.params
 * - Calling categoryService
 * - Returning response (res.json)
 * - Handling errors
 */

// Temporarily hide empty categories from catalog/admin (uncomment to show again)
const HIDDEN_CATEGORY_NAMES = ['clothing', 'accessories']

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategoriesController = async (req, res) => {
  try {
    let categories = await categoryService.getAllCategories()
    categories = categories.filter(
      (c) => !HIDDEN_CATEGORY_NAMES.includes((c.name || '').toLowerCase().trim())
    )
    res.status(200).json({
      categories
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

/**
 * Get category by ID
 * GET /api/categories/:id
 */
const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const category = await categoryService.getCategoryById(id)
    
    res.status(200).json({
      category
    })

  } catch (error) {
    const statusCode = error.message === 'Category not found' ? 404 : 500
    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Create new category
 * POST /api/categories
 * Body: { name: "Category Name" }
 */
const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Category name is required'
      })
    }

    const category = await categoryService.createCategory(name)

    res.status(201).json({
      message: 'Category created successfully',
      category
    })

  } catch (error) {
    const statusCode = error.message.includes('already exists') ? 409 : 400
    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Update category
 * PUT /api/categories/:id
 * Body: { name: "Updated Category Name" }
 */
const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Category name is required'
      })
    }

    const category = await categoryService.updateCategory(id, name)

    res.status(200).json({
      message: 'Category updated successfully',
      category
    })

  } catch (error) {
    let statusCode = 500
    if (error.message === 'Category not found') {
      statusCode = 404
    } else if (error.message.includes('already exists') || error.message.includes('at least')) {
      statusCode = 400
    }

    res.status(statusCode).json({
      error: error.message
    })
  }
}

/**
 * Delete category
 * DELETE /api/categories/:id
 */
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params
    await categoryService.deleteCategory(id)

    res.status(200).json({
      message: 'Category deleted successfully'
    })

  } catch (error) {
    const statusCode = error.message === 'Category not found' ? 404 : 500
    res.status(statusCode).json({
      error: error.message
    })
  }
}

module.exports = { getAllCategoriesController, getCategoryByIdController, createCategoryController, updateCategoryController, deleteCategoryController }
