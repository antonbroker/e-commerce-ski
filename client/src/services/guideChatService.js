import api from './api'

/**
 * Send chat history to Ski Guide API (auth required).
 * @param {Array<{ role: 'user'|'assistant', content: string }>} messages
 * @returns {Promise<{ reply: string }>}
 */
export const sendGuideChat = async (messages) => {
  const { data } = await api.post('/guide-chat', { messages: messages || [] })
  return data
}
