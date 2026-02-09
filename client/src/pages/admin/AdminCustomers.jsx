import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getCustomers, getCustomerOrders } from '../../services/adminService'

/**
 * Admin Customers Page - list of customers, click row to see orders
 */

function AdminCustomers() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/')
      return
    }
    const fetchCustomers = async () => {
      try {
        setError('')
        const data = await getCustomers()
        setCustomers(data.customers ?? [])
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (!selectedCustomer) {
      setOrders([])
      return
    }
    let cancelled = false
    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const data = await getCustomerOrders(selectedCustomer._id)
        if (!cancelled) setOrders(data.orders ?? [])
      } catch (err) {
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }
    fetchOrders()
    return () => { cancelled = true }
  }, [selectedCustomer])

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
      return dateStr ?? '—'
    }
  }

  const handleRowClick = (c) => {
    setSelectedCustomer((prev) => (prev?._id === c._id ? null : c))
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-page">
      <h1>Customers</h1>

      {error && (
        <div className="admin-error" style={{ color: '#c00', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Username</th>
                  <th>First name</th>
                  <th>Last name</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#666' }}>
                      No customers yet
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => handleRowClick(c)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedCustomer?._id === c._id ? '#f0f4ff' : undefined
                      }}
                    >
                      <td>{c.email ?? '—'}</td>
                      <td>{c.username ?? '—'}</td>
                      <td>{c.firstName ?? '—'}</td>
                      <td>{c.lastName ?? '—'}</td>
                      <td>{formatDate(c.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {selectedCustomer && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fafafa' }}>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                Orders: {selectedCustomer.firstName} {selectedCustomer.lastName}
              </h2>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p style={{ color: '#666' }}>No orders yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((order) => (
                    <div key={order._id} style={{ padding: '1rem', background: '#fff', borderRadius: '6px', border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#555' }}>{formatDate(order.createdAt)}</span>
                        <span style={{ fontWeight: 600 }}>Total: ${order.totalAmount?.toFixed(2) ?? '0.00'}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.product?.title ?? '—'} × {item.quantity} — ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminCustomers
