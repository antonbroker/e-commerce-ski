const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middleware/auth')

/**
 * All routes require authentication (customer places order, views own orders)
 * POST /api/orders - create order (body: { items, totalAmount })
 * GET /api/orders - get current user's orders
 */

router.post('/', authMiddleware, orderController.createOrderController)
router.get('/', authMiddleware, orderController.getMyOrdersController)

module.exports = router
