import api from './api'

/**
 * Create order (auth required).
 * @param {{ items: { productId: string, quantity: number }[], totalAmount: number }} payload
 */
export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload)
  return data
}

/**
 * Get current user's orders (auth required).
 */
export const getMyOrders = async () => {
  const { data } = await api.get('/orders')
  return data
}
