const authService = require('../services/authService')

/**
 * Auth Controller - handling HTTP requests for authentication
 * 
 * Responsible for:
 * - Getting data from req.body
 * - Calling authService
 * - Returning response (res.json)
 * - Handling errors
 */

/**
 * Register new user
 * POST /api/auth/register
 * Body: { email, username, firstName, lastName, password }
 */
const registerController = async (req, res) => {
  try {
    const { email, username, firstName, lastName, password } = req.body;

    // Validation of required fields
    if (!email || !username || !firstName || !lastName || !password) {
      return res.status(400).json({ 
        error: 'All fields are required: email, username, firstName, lastName, password' 
      })
    }

    // Calling service (all logic there)
    const { user, token } = await authService.register({
      email,
      username,
      firstName,
      lastName,
      password
    })

    // Successful response
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    })

  } catch (error) {
    // Handling errors
    const statusCode = error.message.includes('already exists') ? 409 : 400

    res.status(statusCode).json({ 
      error: error.message 
    })
  }
}


/**
 * User login
 * POST /api/auth/login
 * Body: { email, password }
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation of required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    // Calling service
    const { user, token } = await authService.login(email, password)

    // Successful response
    res.status(200).json({
      message: 'Login successful',
      user,
      token
    })

  } catch (error) {
    res.status(401).json({ 
      error: error.message 
    })
  }
}

/**
 * Login with Google ID token
 * POST /api/auth/google
 * Body: { credential } (ID token from Google)
 */
const googleLoginController = async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' })
    }
    const { user, token } = await authService.loginWithGoogle(credential)
    res.status(200).json({ message: 'Login successful', user, token })
  } catch (error) {
    const status = error.message?.includes('not configured') ? 503 : 401
    res.status(status).json({ error: error.message || 'Google sign-in failed' })
  }
}

/**
 * Get current user (from token)
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * 
 * req.user added by auth middleware (we'll create it later)
 */
const getMeController = async (req, res) => {
  try {
    // req.user added by auth middleware
    const user = req.user

    if (!user) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      })
    }

    res.status(200).json({
      user
    })

  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

/**
 * Update current user profile (firstName, lastName)
 * PATCH /api/auth/me
 * Body: { firstName, lastName }
 * Auth required
 */
const updateProfileController = async (req, res) => {
  try {
    const { firstName, lastName } = req.body

    const f = typeof firstName === 'string' ? firstName.trim() : ''
    const l = typeof lastName === 'string' ? lastName.trim() : ''

    if (!f || f.length < 2) {
      return res.status(400).json({ error: 'First name is required (min 2 characters)' })
    }
    if (!l || l.length < 2) {
      return res.status(400).json({ error: 'Last name is required (min 2 characters)' })
    }

    const user = await authService.updateProfile(req.user._id, { firstName: f, lastName: l })

    res.status(200).json({ user })
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500
    res.status(status).json({ error: error.message })
  }
}

module.exports = {
  registerController,
  loginController,
  googleLoginController,
  getMeController,
  updateProfileController
}
