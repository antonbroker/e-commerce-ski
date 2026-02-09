import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity, removeFromCart, addToCart, clearCart } from '../store/slices/cartSlice'
import { createOrder } from '../services/orderService'
import { getRecommendations } from '../services/recommendationService'

/**
 * Cart Page - full-page cart with items and AI recommendations
 */

function CartPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart)

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
    if (user?.role === 'admin') navigate('/', { replace: true })
  }, [isAuthenticated, user?.role, navigate])

  const [orderLoading, setOrderLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
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
  }, [items.length, items.map((i) => i.product._id).join(',')])

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

  const handleOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
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
      navigate('/catalog', { state: { orderSuccess: true } })
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Order failed'
      alert(message)
    } finally {
      setOrderLoading(false)
    }
  }

  return (
    <div className="cart-page">
      <div className="cart-page-inner">
        <h1 className="cart-page-title">Your Cart</h1>

        {items.length === 0 ? (
          <div className="cart-page-empty">
            <p>Your cart is empty</p>
            <Link to="/catalog" className="cart-page-empty-link">Go to catalog</Link>
          </div>
        ) : (
          <>
            <section className="cart-page-items">
              {items.map((item) => {
                const { product, quantity } = item
                const itemTotal = product.price * quantity
                return (
                  <div key={product._id} className="cart-page-item">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt="" className="cart-page-item-img" />
                    )}
                    <div className="cart-page-item-info">
                      <h3 className="cart-page-item-title">{product.title}</h3>
                      <span className="cart-page-item-price">${product.price.toFixed(2)} each</span>
                      <div className="cart-page-item-actions">
                        <button
                          type="button"
                          className="cart-page-qty-btn"
                          onClick={() => handleDecreaseQuantity(product._id, quantity)}
                        >
                          −
                        </button>
                        <span className="cart-page-qty">{quantity}</span>
                        <button
                          type="button"
                          className="cart-page-qty-btn"
                          onClick={() => handleIncreaseQuantity(product._id, quantity, product.stock)}
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="cart-page-item-total">
                      ${itemTotal.toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </section>

            <div className="cart-page-order-row">
              <div className="cart-page-total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="cart-page-order-btn"
                onClick={handleOrder}
                disabled={orderLoading}
              >
                {orderLoading ? 'Placing order...' : 'Place order'}
              </button>
            </div>

            <section className="cart-page-recommendations">
              <h2 className="cart-page-recommendations-title">Recommended for you</h2>
              {recommendationsLoading ? (
                <p className="cart-page-recommendations-loading">Loading suggestions…</p>
              ) : recommendations.length > 0 ? (
                <div className="cart-page-recommendations-grid">
                  {recommendations.map((product) => {
                    const inCart = items.find((item) => item.product._id === product._id)
                    const qty = inCart ? inCart.quantity : 0
                    return (
                      <div key={product._id} className="cart-page-rec-card">
                        {product.imageUrl && (
                          <img src={product.imageUrl} alt="" className="cart-page-rec-img" />
                        )}
                        <div className="cart-page-rec-body">
                          <h4 className="cart-page-rec-title">{product.title}</h4>
                          <span className="cart-page-rec-price">${product.price?.toFixed(2) ?? '0.00'}</span>
                          <button
                            type="button"
                            className="cart-page-rec-add"
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
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default CartPage
