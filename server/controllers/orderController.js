const orderService = require('../services/orderService')

/**
 * Order Controller - HTTP handlers for orders
 */

/**
 * POST /api/orders
 * Body: { items: [{ productId, quantity }], totalAmount }
 * Auth required (req.user from middleware)
 */
const createOrderController = async (req, res) => {
  try {
    const { items, totalAmount } = req.body
    const order = await orderService.createOrder(req.user._id, { items, totalAmount })
    res.status(201).json({ order })
  } catch (error) {
    const status = error.message.includes('not found') || error.message.includes('Not enough')
      ? 400
      : 500
    res.status(status).json({ error: error.message })
  }
}

/**
 * GET /api/orders
 * Returns orders for the current user (req.user)
 */
const getMyOrdersController = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user._id)
    res.status(200).json({ orders })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { createOrderController, getMyOrdersController }
