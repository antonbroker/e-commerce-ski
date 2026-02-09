const guideChatService = require('../services/guideChatService')

/**
 * POST /api/guide-chat
 * Body: { messages: [{ role: 'user'|'assistant', content: string }] }
 * Returns: { reply: string }
 */
const postGuideChatController = async (req, res) => {
  try {
    const { messages } = req.body || {}
    const { reply, products } = await guideChatService.getGuideReply(messages)
    res.status(200).json({ reply, products: products || [] })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to get guide reply' })
  }
}

module.exports = { postGuideChatController }
