const OpenAI = require('openai')
const productRepository = require('../repositories/productRepository')

const FALLBACK_REPLY = "I'm sorry, the guide is temporarily unavailable. Please try again later or browse our catalog."

/**
 * Build system prompt with current catalog so the guide can recommend real products.
 */
function buildSystemPrompt(catalogForLLM) {
  const catalogText = catalogForLLM.length === 0
    ? 'Our catalog is currently empty.'
    : catalogForLLM.map(p => `- id: "${p.id}", title: "${p.title}", category: "${p.category}", price: ${p.price}${p.size ? `, size: ${p.size}` : ''}${p.length ? `, length: ${p.length}cm` : ''}${p.brand ? `, brand: ${p.brand}` : ''}`).join('\n')

  return `You are a friendly virtual ski guide for a winter sports e-commerce shop. You help customers choose the right equipment: skis, boots, clothing, accessories. You have access to our REAL product catalog below. Use it to recommend specific products when the user asks for suggestions (e.g. "which ski do you recommend", "what boots for beginners").

Our catalog (use these exact IDs when recommending):
${catalogText}

Rules:
- When the user asks for a product recommendation, pick 1–4 products from the catalog that best match (level, destination, preferences from the conversation) and mention them in your reply by name.
- Keep replies concise (2–5 sentences) unless they ask for detail. Be warm and professional.
- At the very end of your message, on a new line, output exactly: PRODUCT_IDS: id1,id2,id3 (the MongoDB _id values from the catalog, comma-separated, no spaces). If you are not recommending any specific products this turn, write only: PRODUCT_IDS:
- Do not make up product names or IDs—only use IDs from the catalog above.`
}

/**
 * Parse PRODUCT_IDS: ... line from the end of the reply; return { cleanReply, ids }.
 */
function parseProductIds(reply) {
  const lineMatch = reply.match(/\nPRODUCT_IDS:\s*([^\n]*)$/i)
  if (!lineMatch) {
    return { cleanReply: reply.trim(), ids: [] }
  }
  const line = lineMatch[0]
  const idsStr = (lineMatch[1] || '').trim()
  const cleanReply = reply.replace(/\nPRODUCT_IDS:.*$/i, '').trim()
  if (!idsStr) return { cleanReply, ids: [] }
  const ids = idsStr.split(',').map(s => s.trim()).filter(Boolean)
  return { cleanReply, ids }
}

/**
 * Send conversation history to OpenAI with catalog context; return reply and recommended products.
 * messages: [{ role: 'user'|'assistant', content: string }]
 * Returns { reply: string, products: Product[] }
 */
const getGuideReply = async (messages) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return { reply: FALLBACK_REPLY, products: [] }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { reply: FALLBACK_REPLY, products: [] }
  }

  const openaiMessages = messages
    .filter(m => m.role && m.content && ['user', 'assistant'].includes(m.role))
    .map(m => ({ role: m.role, content: String(m.content).trim() }))
    .filter(m => m.content.length > 0)

  if (openaiMessages.length === 0) {
    return { reply: FALLBACK_REPLY, products: [] }
  }

  const allProducts = await productRepository.getAllProducts({}, { title: 1 })
  const catalogForLLM = allProducts.map(p => ({
    id: p._id.toString(),
    title: p.title,
    category: p.category?.name || 'N/A',
    price: p.price,
    size: p.size,
    length: p.length,
    brand: p.brand
  }))
  const systemPrompt = buildSystemPrompt(catalogForLLM)

  try {
    const openai = new OpenAI({ apiKey: apiKey.trim() })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...openaiMessages
      ],
      max_tokens: 400
    })
    const rawReply = completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY
    const { cleanReply, ids } = parseProductIds(rawReply)

    let products = []
    if (ids.length > 0) {
      const found = await productRepository.getProductsByIds(ids)
      const idOrder = new Map(ids.map((id, i) => [id, i]))
      products = found.sort((a, b) => {
        const aId = a._id.toString()
        const bId = b._id.toString()
        return (idOrder.get(aId) ?? 99) - (idOrder.get(bId) ?? 99)
      })
    }

    return { reply: cleanReply, products }
  } catch (err) {
    console.error('Guide chat API error:', err.message)
    return { reply: FALLBACK_REPLY, products: [] }
  }
}

module.exports = { getGuideReply }
