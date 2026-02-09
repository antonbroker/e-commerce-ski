const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const userRepository = require('../repositories/userRepository')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/**
 * Auth Service - business logic for authentication
 * 
 * Responsible for:
 * - Registering users
 * - User login
 * - Checking JWT tokens
 * - Hashing passwords
 */

/**
 * Register new user
 * userData - { email, username, firstName, lastName, password }
 */
const register = async (userData) => {
  const { email, username, firstName, lastName, password } = userData

  // 1. Password validation
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  // 2. Check if email already exists
  const existingUserByEmail = await userRepository.getUserByEmail(email)
  if (existingUserByEmail) {
    throw new Error('Email already exists')
  }

  // 3. Check if username already exists
  const existingUserByUsername = await userRepository.getUserByUsername(username)
  if (existingUserByUsername) {
    throw new Error('Username already exists')
  }

  // 4. Hash password (NEVER store passwords in plain text!)
  // bcrypt.hash(password, saltRounds)
  // saltRounds = 10 → number of hash rounds (balance speed/security)
  const passwordHash = await bcrypt.hash(password, 10)

  // 5. Create user (role: 'customer' by default in the model)
  const user = await userRepository.createUser({
    email,
    username,
    firstName,
    lastName,
    passwordHash
  })

  // 6. Generate JWT token
  const token = generateToken(user)

  // 7. Return user and token (passwordHash hidden thanks to toJSON)
  return { user, token }
};


/**
 * User login
 */
const login = async (email, password) => {
  const user = await userRepository.getUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password')
  }
  if (!user.passwordHash) {
    throw new Error('Please use Google to sign in')
  }
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }
  const token = generateToken(user)
  return { user, token }
}

/**
 * Login or register with Google ID token
 */
const loginWithGoogle = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google sign-in is not configured')
  }
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  const email = (payload.email || '').toLowerCase()
  if (!email) {
    throw new Error('Google account has no email')
  }
  const firstName = payload.given_name || payload.name || 'User'
  const lastName = payload.family_name || ''
  let user = await userRepository.getUserByEmail(email)
  if (!user) {
    const baseUsername = (payload.email || '').split('@')[0].replace(/\W/g, '') || 'user'
    let username = baseUsername
    let tries = 0
    while (await userRepository.getUserByUsername(username)) {
      username = `${baseUsername}_${payload.sub?.slice(-6) || Date.now().toString(36)}${tries > 0 ? tries : ''}`
      tries++
    }
    user = await userRepository.createUser({
      email,
      username,
      firstName,
      lastName
    })
  }
  const token = generateToken(user)
  return { user, token }
}

/**
 * Check JWT token and get user
 */
const verifyToken = async (token) => {
  try {
    // 1. Decode JWT token
    // jwt.verify verifies the token signature using the SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // 2. Get user by ID from token
    const user = await userRepository.getUserById(decoded.userId)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return user

  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Update current user profile (firstName, lastName)
 */
const updateProfile = async (userId, { firstName, lastName }) => {
  const user = await userRepository.updateUser(userId, { firstName, lastName })
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  // Payload - data we store in the token
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  }

  // jwt.sign(payload, secret, options)
  // expiresIn: '7d' → token lives for 7 days, then you need to log in again
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  return token
}

module.exports = { register, login, loginWithGoogle, verifyToken, updateProfile }
