import api from './api'

/**
 * Get AI recommendations for cart (auth required).
 * @param {string[]} productIds - IDs of products in cart
 * @returns {Promise<{ products: Array }>}
 */
export const getRecommendations = async (productIds) => {
  const { data } = await api.post('/recommendations', { productIds: productIds || [] })
  return data
}
