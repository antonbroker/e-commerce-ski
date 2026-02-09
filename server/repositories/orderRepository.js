const mongoose = require('mongoose')
const Order = require('../models/Order')

/**
 * Order Repository - database layer for Order model
 */

const createOrder = async (orderData) => {
  const order = await Order.create(orderData)
  return await Order.findById(order._id).populate('user', 'firstName lastName email').populate('items.product', 'title price')
}

const getOrdersByUserId = async (userId) => {
  return await Order.find({ user: userId })
    .populate('items.product', 'title price imageUrl')
    .sort({ createdAt: -1 })
}

/**
 * Aggregate: sold quantity per product (for pie/bar chart).
 * If userId is provided, only that customer's orders are included.
 * Returns [{ name: product title, value: quantity, category: category name }]
 */
const getSalesByProduct = async (userId = null) => {
  const pipeline = []
  if (userId) {
    pipeline.push({ $match: { user: new mongoose.Types.ObjectId(userId) } })
  }
  pipeline.push(
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalQuantity: { $sum: '$items.quantity' } } },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
    { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'categories', localField: 'p.category', foreignField: '_id', as: 'cat' } },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$p.title', 'Unknown'] }, value: '$totalQuantity', category: { $ifNull: ['$cat.name', '—'] }, _id: 0 } }
  )
  const result = await Order.aggregate(pipeline)
  return result
}

module.exports = { createOrder, getOrdersByUserId, getSalesByProduct }
