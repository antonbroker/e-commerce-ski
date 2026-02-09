const authService = require('../services/authService')

/**
 * Auth Middleware - check JWT token
 * 
 * How it works:
 * 1. Get token from Authorization header: Bearer <token>
 * 2. Check token through authService.verifyToken()
 * 3. If valid → add req.user and pass to next()
 * 4. If invalid → return 401 Unauthorized
 * 
 * Usage:
 * router.get('/me', authMiddleware, authController.getMeController)
 */

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Please include Authorization: Bearer <token>' 
      })
    }

    // 2. Extract token (remove "Bearer ")
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Token is missing' 
      })
    }

    // 3. Check token and get user
    // authService.verifyToken() decrypts JWT and finds user in DB
    const user = await authService.verifyToken(token)

    // 4. Add user to req (so controller can use it)
    req.user = user

    // 5. Continue execution (pass to controller)
    next()

  } catch (error) {
    // If token is invalid or expired
    return res.status(401).json({ 
      error: error.message || 'Invalid or expired token' 
    })
  }
}

module.exports = authMiddleware
