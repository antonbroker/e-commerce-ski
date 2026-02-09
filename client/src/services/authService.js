import api from './api'

/**
 * Auth Service (Frontend) - functions for auth API
 *
 * Uses axios instance (api) for HTTP requests
 * All requests go to http://localhost:3000/api/auth/*
 */

/**
 * Register new user
 * @param {Object} userData - { email, username, firstName, lastName, password }
 * @returns {Promise<{user, token}>}
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

/**
 * User login
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

/**
 * Login with Google (ID token from Google Sign-In)
 * @param {string} credential - ID token from credentialResponse.credential
 * @returns {Promise<{user, token}>}
 */
export const loginWithGoogle = async (credential) => {
  const response = await api.post('/auth/google', { credential })
  return response.data
}

/**
 * Get current user (from token)
 * @returns {Promise<{user}>}
 */
export const getMe = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

/**
 * Update profile (firstName, lastName)
 * @param {{ firstName: string, lastName: string }} data
 * @returns {Promise<{user}>}
 */
export const updateProfile = async (data) => {
  const response = await api.patch('/auth/me', data)
  return response.data
}
