const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/auth')

/**
 * Auth Routes - routes for authentication
 * 
 * All routes start with /api/auth (connected in server.js)
 * 
 * Routes:
 * - POST /api/auth/register - registration
 * - POST /api/auth/login - login
 * - GET /api/auth/me - get current user (protected)
 * - PATCH /api/auth/me - update profile firstName, lastName (protected)
 */

/**
 * POST /api/auth/register
 * Registration of a new user
 */
router.post('/register', authController.registerController)

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', authController.loginController)

/**
 * POST /api/auth/google
 * Login with Google ID token (credential from Google Sign-In)
 */
router.post('/google', authController.googleLoginController)

/**
 * GET /api/auth/me
 * Get current user (from token)
 * 
 * Protected route - requires valid JWT token
 * authMiddleware checks token and adds req.user
 */
router.get('/me', authMiddleware, authController.getMeController)

/**
 * PATCH /api/auth/me
 * Update current user profile (firstName, lastName)
 */
router.patch('/me', authMiddleware, authController.updateProfileController)

module.exports = router
