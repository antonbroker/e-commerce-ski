const mongoose = require('mongoose');

/**
 * User Model - user schema
 * 
 * Fields:
 * - email: for login and notifications (unique)
 * - username: for display in UI (unique)
 * - firstName, lastName: user name
 * - passwordHash: encrypted password (never store in plain text!)
 * - role: "admin" or "customer"
 * - createdAt: registration date
 */

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,  // automatically lowercase (Test@Mail.com → test@mail.com)
    trim: true,       // remove spaces
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  
  passwordHash: {
    type: String,
    required: false  // optional for Google sign-in users
  },
  
  role: {
    type: String,
    enum: ['admin', 'customer'],  // only these two values
    default: 'customer'            // by default all customers
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
})

/**
 * Indexes for fast search
 * MongoDB automatically creates indexes for email and username
 * This speeds up queries like User.findOne({ email: "..." })
 */
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

/**
 * Method toJSON - what to return to the client
 * Remove passwordHash from the response (security!)
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;  // NEVER send password to the client!
  delete user.__v;           // remove Mongoose service field
  return user;
};

const User = mongoose.model('User', userSchema)

module.exports = User

