import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../services/orderService'

/**
 * Orders Page - user's orders list
 * Load from API, display date, total and contents of each order
 */

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchOrders = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getMyOrders()
        if (!cancelled && data?.orders) {
          setOrders(data.orders)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.response?.data?.error || err.message || 'Failed to load orders'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [])

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-content-reveal">
          <h1>My Orders</h1>
          <p className="orders-loading">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-content-reveal">
          <h1>My Orders</h1>
          <p className="orders-error">{error}</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-content-reveal">
          <h1>My Orders</h1>
          <div className="orders-empty">
            <p>No orders yet.</p>
            <Link to="/catalog" className="orders-empty-link">Go to catalog</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-content-reveal">
        <h1>My Orders</h1>
        <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <span className="order-date">{formatDate(order.createdAt)}</span>
              <span className="order-total">Total: ${order.totalAmount?.toFixed(2) ?? '0.00'}</span>
            </div>
            <ul className="order-items">
              {order.items?.map((item, index) => (
                <li key={index} className="order-item">
                  <span className="order-item-title">{item.product?.title ?? '—'}</span>
                  <span className="order-item-qty">× {item.quantity}</span>
                  <span className="order-item-price">
                    ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default Orders
