import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { sendGuideChat } from '../services/guideChatService'
import { addToCart } from '../store/slices/cartSlice'
import '../css/guide-chat.css'

const GUIDE_FIRST_MESSAGE = "Hi! I'm your virtual ski guide. I can help you find the right equipment. Where are you planning to go?"

/**
 * Build API messages from UI messages (user/guide -> user/assistant, text -> content).
 */
function toApiMessages(messages) {
  return messages
    .filter(m => m.role && m.text)
    .map(m => ({
      role: m.role === 'guide' ? 'assistant' : m.role,
      content: m.text
    }))
}

/**
 * GuideChat - floating icon that opens a chat panel (Ski Guide bot).
 * Renders bottom-right, above the cart button. Customer only.
 * Uses OpenAI via POST /api/guide-chat for real replies.
 */
function GuideChat() {
  const dispatch = useDispatch()
  const cartItems = useSelector((state) => state.cart.items)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'guide', text: GUIDE_FIRST_MESSAGE }])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = inputValue.trim()
    if (!text) return
    const userMessage = { role: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setError(null)
    setLoading(true)
    try {
      const apiMessages = toApiMessages([...messages, userMessage])
      const { reply, products } = await sendGuideChat(apiMessages)
      setMessages((prev) => [...prev, { role: 'guide', text: reply, products: products || [] }])
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Something went wrong'
      setError(message)
      setMessages((prev) => [...prev, { role: 'guide', text: `Sorry, I couldn't get a reply: ${message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    const inCart = cartItems.find((item) => item.product._id === product._id)
    const qty = inCart ? inCart.quantity : 0
    if (qty >= product.stock) {
      alert(`Only ${product.stock} items available in stock`)
      return
    }
    dispatch(addToCart(product))
  }

  return (
    <>
      <button
        type="button"
        className="guide-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Ski Guide"
        aria-label="Open ski guide chat"
      >
        🎿
      </button>
      {isOpen && (
        <div className="guide-chat-panel">
          <div className="guide-chat-header">
            <h3>Ski Guide</h3>
            <button
              type="button"
              className="guide-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="guide-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className="guide-chat-msg-wrap">
                <div className={`guide-chat-msg guide-chat-msg-${msg.role}`}>
                  <span className="guide-chat-msg-text">{msg.text}</span>
                </div>
                {msg.role === 'guide' && msg.products && msg.products.length > 0 && (
                  <div className="guide-chat-products">
                    {msg.products.map((product) => (
                      <div key={product._id} className="guide-chat-product-card">
                        <Link to="/catalog" className="guide-chat-product-img-wrap">
                          <img src={product.imageUrl} alt={product.title} className="guide-chat-product-img" />
                        </Link>
                        <div className="guide-chat-product-info">
                          <span className="guide-chat-product-title">{product.title}</span>
                          <span className="guide-chat-product-price">${product.price}</span>
                          <button
                            type="button"
                            className="guide-chat-product-add"
                            onClick={() => handleAddToCart(product)}
                            disabled={(cartItems.find((item) => item.product._id === product._id)?.quantity ?? 0) >= product.stock}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="guide-chat-msg guide-chat-msg-guide guide-chat-msg-loading">
                <span className="guide-chat-msg-text">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="guide-chat-form" onSubmit={handleSend}>
            <input
              type="text"
              className="guide-chat-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="guide-chat-send" disabled={loading}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default GuideChat
