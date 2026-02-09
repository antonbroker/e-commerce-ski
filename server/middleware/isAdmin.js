/**
 * IsAdmin Middleware - check admin role
 * 
 * How it works:
 * 1. Check if req.user exists (must be added by authMiddleware)
 * 2. Check if req.user.role === 'admin'
 * 3. If admin → pass to next()
 * 4. If not admin → return 403 Forbidden
 * 
 * Usage:
 * router.get('/admin/products', authMiddleware, isAdminMiddleware, adminController.getAllProductsController)
 * 
 * IMPORTANT: isAdminMiddleware must come AFTER authMiddleware!
 * Because it uses req.user, which is added by authMiddleware
 */

const isAdminMiddleware = (req, res, next) => {
  // 1. Check if user exists (authMiddleware must have added it)
  if (!req.user) {
    return res.status(401).json({ 
      error: 'User not authenticated. Please use authMiddleware first.' 
    })
  }

  // 2. Check role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.' 
    })
  }

  // 3. Continue execution (user is admin)
  next()
}

module.exports = isAdminMiddleware
