import { createSlice } from '@reduxjs/toolkit';

/**
 * Auth Slice - manages auth state
 *
 * State stored in store:
 * - user: user object (email, role) or null
 * - token: JWT token or null
 * - isAuthenticated: boolean
 */

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Loading state while restoring user from token
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // User login (after successful login/register)
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      sessionStorage.setItem('token', action.payload.token);
    },
    // User logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      sessionStorage.removeItem('token');
    },
    // Restore user from token (on page reload)
    restoreUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Update user data in store (after PATCH /auth/me)
    updateUser: (state, action) => {
      if (state.user && action.payload) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, restoreUser, setLoading, updateUser } = authSlice.actions;

export default authSlice.reducer;

