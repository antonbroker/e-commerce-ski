const mongoose = require('mongoose')

/**
 * Product Model - product schema
 * 
 * Fields:
 * - title: product name
 * - price: product price
 * - category: reference to Category model
 * - imageUrl: link to product image
 * - stock: quantity in stock
 * - gender: target gender (men, woman) - optional
 * - length: product length (for skis, etc.) - optional
 * - size: product size (for boots/shoes) - optional
 * - brand: product brand - optional
 * - color: product color - optional
 * - createdAt: creation date
 */

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [2, 'Product title must be at least 2 characters'],
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  gender: {
    type: String,
    enum: ['men', 'woman'],
    required: false, // Optional (for products where gender is not relevant)
    trim: true
  },
  
  // Optional filters by category (e.g. Skis)
  length: {
    type: Number,
    required: false, // Optional (for products where length matters, e.g. skis)
    min: [0, 'Length cannot be negative']
  },

  size: {
    type: String,
    required: false, // Optional (for boots/shoes)
    trim: true,
    maxlength: [20, 'Size cannot exceed 20 characters']
  },
  
  brand: {
    type: String,
    required: false, // Optional
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  
  color: {
    type: String,
    required: false, // Optional
    trim: true,
    maxlength: [50, 'Color name cannot exceed 50 characters']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
})

/**
 * Indexes for fast search
 */
productSchema.index({ category: 1 })
productSchema.index({ title: 1 })

/**
 * Method toJSON - what to return to the client
 */
productSchema.methods.toJSON = function() {
  const product = this.toObject()
  delete product.__v
  return product
}

const Product = mongoose.model('Product', productSchema)

module.exports = Product
