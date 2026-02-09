import api from './api'

/**
 * Product Service (Frontend) - functions for product API
 * 
 * Uses axios instance (api) for HTTP requests
 * All requests go to http://localhost:3000/api/products/*
 */

/**
 * Get all products with optional filters
 * @param {String} queryString - optional query string like "?category=123&minPrice=100"
 * @returns {Promise<{products: Product[]}>}
 */
export const getAllProducts = async (queryString = '') => {
  const response = await api.get(`/products${queryString}`)
  return response.data
}

/**
 * Get product by ID
 * @param {String} productId
 * @returns {Promise<{product: Product}>}
 */
export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`)
  return response.data
}

/**
 * Get products by category
 * @param {String} categoryId
 * @returns {Promise<{products: Product[]}>}
 */
export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/products/category/${categoryId}`)
  return response.data
}

/**
 * Create new product
 * @param {Object} productData - { title, price, category, imageUrl, stock }
 * @returns {Promise<{product: Product}>}
 */
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData)
  return response.data
}

/**
 * Update product
 * @param {String} productId
 * @param {Object} productData - { title?, price?, category?, imageUrl?, stock? }
 * @returns {Promise<{product: Product}>}
 */
export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData)
  return response.data
}

/**
 * Delete product
 * @param {String} productId
 * @returns {Promise<void>}
 */
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`)
  return response.data
}

/**
 * Get filter options (unique brands, colors)
 * @returns {Promise<{brands: string[], colors: string[]}>}
 */
export const getFilterOptions = async () => {
  const response = await api.get('/products/filters/options')
  return response.data
}
