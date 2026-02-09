import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

/**
 * Redux Store - central state
 *
 * Structure:
 * {
 *   auth: { user, token, isAuthenticated },
 *   cart: { items, totalItems, totalPrice }
 * }
 */

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer
  },
});

export default store;

