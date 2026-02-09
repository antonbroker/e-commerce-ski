import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { getSalesByProduct, getCustomers } from '../../services/adminService'

const COLORS = ['#5c6bc0', '#66bb6a', '#ef5350', '#ffa726', '#ab47bc', '#26a69a', '#42a5f5', '#9ccc65']

/**
 * Admin Statistics - sales by product: pie (All) or bar (per customer)
 */

function AdminStatistics() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/')
      return
    }
    const loadCustomers = async () => {
      try {
        const res = await getCustomers()
        setCustomers(res?.customers ?? [])
      } catch {
        setCustomers([])
      }
    }
    loadCustomers()
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') return
    const fetchData = async () => {
      try {
        setError('')
        setLoading(true)
        const res = await getSalesByProduct(selectedCustomerId || undefined)
        setChartData(res?.data ?? [])
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated, user, selectedCustomerId])

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  const selectedCustomer = selectedCustomerId ? customers.find((c) => c._id === selectedCustomerId) : null
  const chartSubtitle = selectedCustomerId === '' ? 'All' : (selectedCustomer ? `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || selectedCustomer.email : 'Customer')

  return (
    <div className="admin-page" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>Sales by product</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="stats-customer" style={{ marginRight: 8 }}>Customer: </label>
        <select
          id="stats-customer"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          style={{ padding: '6px 10px', minWidth: 200 }}
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {(c.firstName || c.lastName) ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : c.email}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="admin-error" style={{ color: '#c00', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : chartData.length === 0 ? (
        <p style={{ color: '#666' }}>No sales data yet. Place some orders to see the chart.</p>
      ) : selectedCustomerId === '' ? (
        (() => {
          const total = chartData.reduce((s, d) => s + d.value, 0)
          const getPercent = (value) => (total > 0 ? ((value / total) * 100).toFixed(1) : '0')
          return (
            <>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>({chartSubtitle})</p>
              <div style={{ perspective: '800px', width: 420, height: 420, margin: '0 auto 1.5rem', transform: 'rotateX(12deg)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={88}
                      outerRadius={165}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => {
                      const pct = getPercent(value)
                      return [`${value} sold (${pct}%)`, name]
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'left' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#333' }}>
                  {chartData.map((item, index) => (
                    <li key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #eee' }}>
                      <span style={{ width: 12, height: 12, borderRadius: 2, flexShrink: 0, background: COLORS[index % COLORS.length] }} />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: '#666' }}>— {item.category ?? '—'}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{item.value} sold ({getPercent(item.value)}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )
        })()
      ) : (
        <>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>({chartSubtitle})</p>
          <div style={{ width: '100%', maxWidth: 560, height: 360, margin: '0 auto 1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 16, right: 16, left: 16, bottom: 60 }}>
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [value, 'Quantity']} />
                <Bar dataKey="value" fill={COLORS[0]} name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminStatistics
