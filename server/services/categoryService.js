const categoryRepository = require('../repositories/categoryRepository')

/**
 * Category Service - business logic for categories
 * 
 * Responsible for:
 * - Getting all categories
 * - Creating categories
 * - Updating categories
 * - Deleting categories
 * - Validating category names
 */

/**
 * Get all categories
 */
const getAllCategories = async () => {
  return await categoryRepository.getAllCategories()
}

/**
 * Get category by ID
 */
const getCategoryById = async (categoryId) => {
  const category = await categoryRepository.getCategoryById(categoryId)
  
  if (!category) {
    throw new Error('Category not found')
  }
  
  return category
}

/**
 * Create new category
 */
const createCategory = async (name) => {
  // 1. Validate name
  if (!name || name.trim().length < 2) {
    throw new Error('Category name must be at least 2 characters')
  }

  // 2. Check if category with this name already exists
  const existingCategory = await categoryRepository.getCategoryByName(name)
  if (existingCategory) {
    throw new Error('Category name already exists')
  }

  // 3. Create category
  const category = await categoryRepository.createCategory({ name: name.trim() })
  
  return category
}

/**
 * Update category
 */
const updateCategory = async (categoryId, name) => {
  // 1. Check if category exists
  const category = await categoryRepository.getCategoryById(categoryId)
  if (!category) {
    throw new Error('Category not found')
  }

  // 2. Validate name
  if (!name || name.trim().length < 2) {
    throw new Error('Category name must be at least 2 characters')
  }

  // 3. Check if another category with this name exists
  const existingCategory = await categoryRepository.getCategoryByName(name)
  if (existingCategory && existingCategory._id.toString() !== categoryId) {
    throw new Error('Category name already exists')
  }

  // 4. Update category
  const updatedCategory = await categoryRepository.updateCategory(categoryId, { name: name.trim() })
  
  return updatedCategory
}

/**
 * Delete category
 */
const deleteCategory = async (categoryId) => {
  // 1. Check if category exists
  const category = await categoryRepository.getCategoryById(categoryId)
  if (!category) {
    throw new Error('Category not found')
  }

  // 2. Delete category
  const deletedCategory = await categoryRepository.deleteCategory(categoryId)
  
  return deletedCategory
}

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory }
