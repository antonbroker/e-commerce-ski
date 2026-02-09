import api from './api'

/**
 * Admin API - for admin-only requests
 */

/**
 * List all customers (role === 'customer')
 * Requires token with role admin
 */
export const getCustomers = async () => {
  const { data } = await api.get('/admin/customers')
  return data
}

/**
 * Orders for a specific customer by id (admin)
 */
export const getCustomerOrders = async (customerId) => {
  const { data } = await api.get(`/admin/customers/${customerId}/orders`)
  return data
}

/**
 * Sales by product (for pie/bar charts).
 * customerId — optional; if provided, only that customer's orders.
 * Returns { data: [{ name, value, category? }] }.
 */
export const getSalesByProduct = async (customerId) => {
  const params = customerId ? { userId: customerId } : {}
  const { data } = await api.get('/admin/statistics/sales-by-product', { params })
  return data
}
