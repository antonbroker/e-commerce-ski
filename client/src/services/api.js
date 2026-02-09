import axios from 'axios';

/**
 * Axios instance - configured HTTP client for API
 *
 * baseURL is prepended to all requests
 * e.g. api.get('/health') → http://localhost:3000/api/health
 */

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor - adds token to every request
 * Before each request: if token in sessionStorage, set Authorization header
 */
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

