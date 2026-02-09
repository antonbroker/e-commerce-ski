const OpenAI = require('openai')
const productRepository = require('../repositories/productRepository')

/**
 * Get cart + catalog summary for LLM, then call OpenAI and return recommended product IDs.
 * If OPENAI_API_KEY is not set, returns [].
 */
const getRecommendations = async (cartProductIds) => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return []
  }

  if (!cartProductIds || cartProductIds.length === 0) {
    return []
  }

  const allProducts = await productRepository.getAllProducts({}, { title: 1 })
  const catalogForLLM = allProducts.map(p => ({
    id: p._id.toString(),
    title: p.title,
    category: p.category?.name || 'N/A'
  }))

  const cartProducts = allProducts.filter(p => cartProductIds.includes(p._id.toString()))
  const cartSummary = cartProducts.map(p => `${p.title} (${p.category?.name || 'N/A'})`).join(', ')

  const prompt = `You are a ski and winter sports shop assistant. The customer has these items in their cart: ${cartSummary}.

Our full catalog (id, title, category):
${catalogForLLM.map(p => `- id: "${p.id}", title: "${p.title}", category: "${p.category}"`).join('\n')}

Suggest 4 to 6 product IDs from our catalog that would complement their purchase (e.g. accessories, matching gear, things often bought together). Do NOT suggest products already in their cart. Return ONLY a JSON array of product ID strings, nothing else. Example: ["id1","id2","id3"]`

  try {
    const openai = new OpenAI({ apiKey: apiKey.trim() })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    })
    const content = completion.choices[0]?.message?.content?.trim() || ''
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const ids = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    const validIds = Array.isArray(ids) ? ids.filter(id => typeof id === 'string' && id.length > 0) : []
    return validIds
  } catch (err) {
    console.error('Recommendation API error:', err.message)
    return []
  }
}

/**
 * Fetch full products by IDs, preserving order and excluding cart IDs.
 */
const getRecommendedProducts = async (cartProductIds) => {
  const recommendedIds = await getRecommendations(cartProductIds)
  const idsToFetch = recommendedIds.filter(id => !cartProductIds.includes(id))
  if (idsToFetch.length === 0) return []
  const products = await productRepository.getProductsByIds(idsToFetch)
  const orderMap = new Map(idsToFetch.map((id, i) => [id, i]))
  return products.sort((a, b) => (orderMap.get(a._id.toString()) ?? 99) - (orderMap.get(b._id.toString()) ?? 99))
}

module.exports = { getRecommendations, getRecommendedProducts }
