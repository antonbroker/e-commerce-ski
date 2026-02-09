import axios from 'axios';

/**
 * Axios instance - configured HTTP client for API
 *
 * baseURL is prepended to all requests.
 * In dev: VITE_API_URL not set → http://localhost:3000/api
 * In production (Vercel): set VITE_API_URL to your Render API URL (e.g. https://your-app.onrender.com/api)
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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

