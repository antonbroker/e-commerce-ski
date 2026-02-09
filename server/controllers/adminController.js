const userRepository = require('../repositories/userRepository')
const orderRepository = require('../repositories/orderRepository')

/**
 * Admin Controller - handlers for admin-only endpoints
 */

/**
 * GET /api/admin/customers
 * List all users with role 'customer'. Auth + admin required.
 */
const getCustomersController = async (req, res) => {
  try {
    const customers = await userRepository.getUsersByRole('customer')
    res.status(200).json({ customers })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * GET /api/admin/customers/:id/orders
 * Orders for customer by id. Auth + admin required.
 */
const getCustomerOrdersController = async (req, res) => {
  try {
    const { id } = req.params
    const orders = await orderRepository.getOrdersByUserId(id)
    res.status(200).json({ orders })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * GET /api/admin/statistics/sales-by-product
 * Optional query: userId — filter by customer. Auth + admin required.
 */
const getSalesByProductController = async (req, res) => {
  try {
    const userId = req.query.userId || null
    const data = await orderRepository.getSalesByProduct(userId)
    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getCustomersController, getCustomerOrdersController, getSalesByProductController }
