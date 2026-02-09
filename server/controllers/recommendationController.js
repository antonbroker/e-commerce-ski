const recommendationService = require('../services/recommendationService')

/**
 * POST /api/recommendations
 * Body: { productIds: string[] } - IDs of products in cart
 * Returns: { products: Product[] } - recommended products (full objects)
 */
const getRecommendationsController = async (req, res) => {
  try {
    const { productIds } = req.body || {}
    const ids = Array.isArray(productIds) ? productIds : []
    const products = await recommendationService.getRecommendedProducts(ids)
    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get recommendations' })
  }
}

module.exports = { getRecommendationsController }
