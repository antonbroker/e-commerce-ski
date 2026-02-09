const express = require('express')
const authMiddleware = require('../middleware/auth')
const recommendationController = require('../controllers/recommendationController')

const router = express.Router()

/**
 * POST /api/recommendations
 * Body: { productIds: string[] }
 * Auth required. Returns { products: Product[] } for cart recommendations.
 */
router.post('/', authMiddleware, recommendationController.getRecommendationsController)

module.exports = router
