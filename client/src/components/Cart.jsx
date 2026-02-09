import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity, removeFromCart, clearCart, addToCart } from '../store/slices/cartSlice'
import { logout } from '../store/slices/authSlice'
import { createOrder } from '../services/orderService'
import { getRecommendations } from '../services/recommendationService'

/**
 * Cart - open/close, list, totals, Order button (sends order then logout)
 */

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart)
  const [isOpen, setIsOpen] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cart-open')
    } else {
      document.body.classList.remove('cart-open')
    }
    return () => document.body.classList.remove('cart-open')
  }, [isOpen])

  // Load AI recommendations when cart is open and has items
  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setRecommendations([])
      return
    }
    let cancelled = false
    setRecommendationsLoading(true)
    getRecommendations(items.map((item) => item.product._id))
      .then((data) => {
        if (!cancelled && data?.products) setRecommendations(data.products)
      })
      .catch(() => {
        if (!cancelled) setRecommendations([])
      })
      .finally(() => {
        if (!cancelled) setRecommendationsLoading(false)
      })
    return () => { cancelled = true }
  }, [isOpen, items.length, items.map((i) => i.product._id).join(',')])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleIncreaseQuantity = (productId, currentQuantity, stock) => {
    if (currentQuantity >= stock) {
      alert(`Only ${stock} items available in stock`)
      return
    }
    dispatch(updateQuantity({ productId, quantity: currentQuantity + 1 }))
  }

  const handleDecreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ productId, quantity: currentQuantity - 1 }))
    } else {
      dispatch(removeFromCart(productId))
    }
  }

  const handleAddRecommendation = (product) => {
    const inCart = items.find((item) => item.product._id === product._id)
    const qty = inCart ? inCart.quantity : 0
    if (qty >= product.stock) {
      alert(`Only ${product.stock} items available in stock`)
      return
    }
    dispatch(addToCart(product))
  }

  const handleOrder = async () => {
    if (items.length === 0) return
    setOrderLoading(true)
    try {
      await createOrder({
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity
        })),
        totalAmount: totalPrice
      })
      dispatch(clearCart())
      dispatch(logout())
      navigate('/login')
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Order failed'
      alert(message)
    } finally {
      setOrderLoading(false)
    }
  }

  // When cart is closed, show only the toggle button
  if (!isOpen) {
    return (
      <button 
        className="cart-toggle-fixed"
        onClick={handleToggle}
        title="Open Cart"
      >
        🛒
        {totalItems > 0 && (
          <span className="cart-badge">{totalItems}</span>
        )}
      </button>
    )
  }

  // When cart is open, show full cart
  return (
    <div className={`cart-container ${isOpen ? 'open' : 'closed'}`}>
      {/* Cart Header */}
      <div className="cart-header">
        <h2>Cart ({totalItems})</h2>
        <button 
          className="cart-toggle-btn"
          onClick={handleToggle}
          title="Close Cart"
        >
          →
        </button>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <p>Add products from the catalog</p>
          </div>
        ) : (
          <div className="cart-items">
            {items.map((item) => {
              const { product, quantity } = item
              const itemTotal = product.price * quantity
              
              return (
                <div key={product._id} className="cart-item">
                  <div className="cart-item-header">
                    <h4 className="cart-item-title">{product.title}</h4>
                    <span className="cart-item-price">${product.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => handleDecreaseQuantity(product._id, quantity)}
                      className="quantity-btn quantity-btn-decrease"
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(product._id, quantity, product.stock)}
                      disabled={quantity >= product.stock}
                      className="quantity-btn quantity-btn-increase"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="cart-item-total">
                    Total: ${itemTotal.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Recommended for you (AI) */}
        {items.length > 0 && (
          <div className="cart-recommendations">
            <h3 className="cart-recommendations-title">Recommended for you</h3>
            {recommendationsLoading ? (
              <p className="cart-recommendations-loading">Loading suggestions…</p>
            ) : recommendations.length > 0 ? (
              <div className="cart-recommendations-grid">
                {recommendations.map((product) => {
                  const inCart = items.find((item) => item.product._id === product._id)
                  const qty = inCart ? inCart.quantity : 0
                  return (
                    <div key={product._id} className="cart-recommendation-card">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt="" className="cart-recommendation-img" />
                      )}
                      <div className="cart-recommendation-body">
                        <span className="cart-recommendation-title">{product.title}</span>
                        <span className="cart-recommendation-price">${product.price?.toFixed(2) ?? '0.00'}</span>
                        <button
                          type="button"
                          className="cart-recommendation-add"
                          onClick={() => handleAddRecommendation(product)}
                          disabled={qty >= product.stock}
                        >
                          {qty >= product.stock ? 'Out of stock' : 'Add to cart'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Cart Footer */}
      {items.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="cart-order-btn"
            onClick={handleOrder}
            disabled={orderLoading}
          >
            {orderLoading ? 'Placing order...' : 'Order'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Cart
