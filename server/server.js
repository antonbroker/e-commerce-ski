require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminRoutes = require('./routes/adminRoutes')
const recommendationRoutes = require('./routes/recommendationRoutes')

// Initialization of Express application
const app = express()

// ============================================
// MIDDLEWARE (intermediate handlers)
// ============================================

// CORS - allows frontend (localhost:5173) to access the API
app.use(cors())

// Parsing JSON in the request body (req.body)
app.use(express.json())

// ============================================
// ROUTES (routes)
// ============================================

/**
 * Health Check endpoint
 * Checks if the server is running and connected to the DB
 */
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    ok: true,
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', authRoutes)

// Category routes
app.use('/api/categories', categoryRoutes)

// Product routes
app.use('/api/products', productRoutes)

// Order routes
app.use('/api/orders', orderRoutes)

// Recommendations (auth required)
app.use('/api/recommendations', recommendationRoutes)

// Admin-only routes (auth + isAdmin required)
app.use('/api/admin', adminRoutes)

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000

// First connect to the DB, then start the server
const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  })
}

startServer()

