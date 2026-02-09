const mongoose = require('mongoose')

/**
 * Category Model - category schema
 * 
 * Fields:
 * - name: category name (unique)
 * - createdAt: creation date
 */

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
})

/**
 * Index for fast search by name
 */
categorySchema.index({ name: 1 })

/**
 * Method toJSON - what to return to the client
 */
categorySchema.methods.toJSON = function() {
  const category = this.toObject()
  delete category.__v
  return category
}

const Category = mongoose.model('Category', categorySchema)

module.exports = Category
