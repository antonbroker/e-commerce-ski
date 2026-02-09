import api from './api'

/**
 * Category Service (Frontend) - functions for category API
 * 
 * Uses axios instance (api) for HTTP requests
 * All requests go to http://localhost:3000/api/categories/*
 */

/**
 * Get all categories
 * @returns {Promise<{categories: Category[]}>}
 */
export const getAllCategories = async () => {
  const response = await api.get('/categories')
  return response.data
}

/**
 * Get category by ID
 * @param {String} categoryId
 * @returns {Promise<{category: Category}>}
 */
export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`)
  return response.data
}

/**
 * Create new category
 * @param {String} name
 * @returns {Promise<{category: Category}>}
 */
export const createCategory = async (name) => {
  const response = await api.post('/categories', { name })
  return response.data
}

/**
 * Update category
 * @param {String} categoryId
 * @param {String} name
 * @returns {Promise<{category: Category}>}
 */
export const updateCategory = async (categoryId, name) => {
  const response = await api.put(`/categories/${categoryId}`, { name })
  return response.data
}

/**
 * Delete category
 * @param {String} categoryId
 * @returns {Promise<void>}
 */
export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/${categoryId}`)
  return response.data
}
