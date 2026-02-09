const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/auth')
const isAdminMiddleware = require('../middleware/isAdmin')
const adminController = require('../controllers/adminController')

/**
 * Admin routes - all require auth + admin role
 * Base path: /api/admin
 */

router.get('/customers', authMiddleware, isAdminMiddleware, adminController.getCustomersController)
router.get('/customers/:id/orders', authMiddleware, isAdminMiddleware, adminController.getCustomerOrdersController)
router.get('/statistics/sales-by-product', authMiddleware, isAdminMiddleware, adminController.getSalesByProductController)

module.exports = router
