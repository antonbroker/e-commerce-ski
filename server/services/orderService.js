const orderRepository = require('../repositories/orderRepository')
const productRepository = require('../repositories/productRepository')

/**
 * Order Service - business logic for orders
 */

/**
 * Create order for user. Validates items exist and stock, then creates order.
 */
const createOrder = async (userId, { items, totalAmount }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order must have at least one item')
  }
  if (typeof totalAmount !== 'number' || totalAmount < 0) {
    throw new Error('Invalid total amount')
  }

  const orderItems = []
  let computedTotal = 0

  for (const { productId, quantity } of items) {
    if (!productId || !quantity || quantity < 1) {
      throw new Error('Each item must have productId and quantity >= 1')
    }
    const product = await productRepository.getProductById(productId)
    if (!product) {
      throw new Error(`Product ${productId} not found`)
    }
    if (product.stock < quantity) {
      throw new Error(`Not enough stock for "${product.title}". Available: ${product.stock}`)
    }
    orderItems.push({ product: productId, quantity })
    computedTotal += product.price * quantity
  }

  if (Math.abs(computedTotal - totalAmount) > 0.01) {
    throw new Error('Total amount does not match items')
  }

  const order = await orderRepository.createOrder({
    user: userId,
    items: orderItems,
    totalAmount: computedTotal
  })

  // Decrement stock for each ordered item
  for (const item of orderItems) {
    await productRepository.decrementStock(item.product, item.quantity)
  }

  return order
}

const getMyOrders = async (userId) => {
  return await orderRepository.getOrdersByUserId(userId)
}

module.exports = { createOrder, getMyOrders }
