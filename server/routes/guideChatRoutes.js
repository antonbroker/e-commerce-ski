const express = require('express')
const authMiddleware = require('../middleware/auth')
const guideChatController = require('../controllers/guideChatController')

const router = express.Router()

/**
 * POST /api/guide-chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 * Auth required. Returns { reply: string }.
 */
router.post('/', authMiddleware, guideChatController.postGuideChatController)

module.exports = router
