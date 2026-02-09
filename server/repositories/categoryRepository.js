const Category = require('../models/Category')

/**
 * Category Repository - database layer for Category model
 * 
 * Only CRUD operations, no business logic!
 * Business logic → in Service layer
 */

// Get all categories
const getAllCategories = async () => {
  return await Category.find().sort({ createdAt: -1 })
}

// Get category by id
const getCategoryById = async (id) => {
  return await Category.findById(id)
}

// Get category by name
const getCategoryByName = async (name) => {
  return await Category.findOne({ name: name.trim() })
}

// Create category
const createCategory = async (categoryData) => {
  try {
    const category = await Category.create(categoryData)
    return category
  } catch (error) {
    // If unique constraint error (duplicate name)
    if (error.code === 11000) {
      throw new Error('Category name already exists')
    }
    throw error
  }
}

// Update category
const updateCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
}

// Delete category
const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id)
}

module.exports = { getAllCategories, getCategoryById, getCategoryByName, createCategory, updateCategory, deleteCategory }