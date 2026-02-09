import { createSlice } from '@reduxjs/toolkit'

/**
 * Cart Slice - manages cart state
 *
 * State:
 * - items: array of cart items [{ product, quantity }, ...]
 * - totalItems, totalPrice
 * - userId: current user id (cart in localStorage under key cart_${userId})
 */

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  userId: null
}

/**
 * Helper to compute totals
 * Called after every items change
 */
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  
  return {
    totalItems,
    totalPrice
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add product to cart
     * If already in cart → increase quantity
     * Otherwise → add new item
     */
    addToCart: (state, action) => {
      const product = action.payload
      
      const existingItem = state.items.find(item => item.product._id === product._id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          product,
          quantity: 1
        })
      }
      
      const { totalItems, totalPrice } = calculateTotals(state.items)
      state.totalItems = totalItems
      state.totalPrice = totalPrice
      
      if (state.userId) {
        localStorage.setItem(`cart_${state.userId}`, JSON.stringify(state.items))
      }
    },
    
    /**
     * Remove product from cart
     */
    removeFromCart: (state, action) => {
      const productId = action.payload
      
      state.items = state.items.filter(item => item.product._id !== productId)
      const { totalItems, totalPrice } = calculateTotals(state.items)
      state.totalItems = totalItems
      state.totalPrice = totalPrice
      
      if (state.userId) {
        localStorage.setItem(`cart_${state.userId}`, JSON.stringify(state.items))
      }
    },
    
    /**
     * Update product quantity
     */
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.product._id === productId)
      
      if (item) {
        item.quantity = Math.max(1, quantity)
        const { totalItems, totalPrice } = calculateTotals(state.items)
        state.totalItems = totalItems
        state.totalPrice = totalPrice
        if (state.userId) {
          localStorage.setItem(`cart_${state.userId}`, JSON.stringify(state.items))
        }
      }
    },
    
    /**
     * Clear cart (after order or on logout)
     */
    clearCart: (state) => {
      if (state.userId) {
        localStorage.removeItem(`cart_${state.userId}`)
      }
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
      state.userId = null
    },
    
    /**
     * Restore cart from localStorage (payload: { items, userId })
     */
    restoreCart: (state, action) => {
      const { items, userId } = action.payload
      state.items = Array.isArray(items) ? items : []
      state.userId = userId ?? null
      const { totalItems, totalPrice } = calculateTotals(state.items)
      state.totalItems = totalItems
      state.totalPrice = totalPrice
    }
  }
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, restoreCart } = cartSlice.actions

export default cartSlice.reducer
