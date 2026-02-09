const mongoose = require('mongoose')

/**
 * Order Model
 * - user: customer who placed the order
 * - items: [{ product (ref), quantity }]
 * - totalAmount: sum of (price * quantity) at order time
 * - createdAt
 */

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

orderSchema.index({ user: 1, createdAt: -1 })

orderSchema.methods.toJSON = function () {
  const order = this.toObject()
  delete order.__v
  return order
}

const Order = mongoose.model('Order', orderSchema)
module.exports = Order
