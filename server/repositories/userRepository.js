const User = require('../models/User')

/**
 * User Repository - layer for working with the User model
 * Only CRUD operations, no business logic!
 */

// Get all users
const getAllUsers = async () => {
  return await User.find()
}

// Get users by role (e.g. 'customer' for admin customers list)
const getUsersByRole = async (role) => {
  return await User.find({ role }).sort({ createdAt: -1 })
}

// Get user by id
const getUserById = async (id) => {
  return await User.findById(id)
}

// Get user by email
const getUserByEmail = async (email) => {
  return await User.findOne({ email: email.toLowerCase() })
}
    
// Get user by username
const getUserByUsername = async (username) => {
  return await User.findOne({ username })
}

// Create new user
const createUser = async (userData) => {
    try {
        const user = await User.create(userData)
        return user;

    } catch (error) {
        // If error is unique constraint (duplicate email/username)
        if (error.code === 11000) {
          const field = Object.keys(error.keyPattern)[0]
          throw new Error(`${field} already exists`)
        }

        throw error
    }
}

// Update user
const updateUser = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
}

// Delete user
const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id)
}

  
module.exports = { getAllUsers, getUsersByRole, getUserById, getUserByEmail, getUserByUsername, createUser, updateUser, deleteUser }
