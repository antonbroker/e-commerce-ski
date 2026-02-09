import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { GoogleLogin } from '@react-oauth/google'
import { login as loginAction } from '../store/slices/authSlice'
import { restoreCart } from '../store/slices/cartSlice'
import { login, loginWithGoogle } from '../services/authService'

/**
 * Login Page
 */

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting login with:', { email })
      
      // 1. Send request to backend
      const response = await login(email, password)
      console.log('Login response:', response)
      
      const { user, token } = response

      dispatch(loginAction({ user, token }))
      try {
        const saved = localStorage.getItem(`cart_${user._id}`)
        const items = saved ? JSON.parse(saved) : []
        dispatch(restoreCart({ items, userId: user._id }))
      } catch {
        dispatch(restoreCart({ items: [], userId: user._id }))
      }
      navigate('/')

    } catch (err) {
      console.error('Login error:', err)
      console.error('Error response:', err.response)
      // Error handling
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.')
      
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return
    setError('')
    setGoogleLoading(true)
    try {
      const { user, token } = await loginWithGoogle(credentialResponse.credential)
      dispatch(loginAction({ user, token }))
      try {
        const saved = localStorage.getItem(`cart_${user._id}`)
        const items = saved ? JSON.parse(saved) : []
        dispatch(restoreCart({ items, userId: user._id }))
      } catch {
        dispatch(restoreCart({ items: [], userId: user._id }))
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>

        {error && (
          <div className="error-message" style={{ 
            color: 'red', 
            marginBottom: '20px', 
            padding: '10px', 
            backgroundColor: '#ffe6e6', 
            borderRadius: '4px' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <div className="auth-google-wrap">
            <span className={`auth-google-custom-btn ${googleLoading ? 'auth-google-custom-btn-loading' : ''}`} role="presentation">
              <span className="auth-google-custom-btn-inner">
                <svg className="auth-google-g" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{googleLoading ? 'Signing in…' : 'Continue with Google'}</span>
              </span>
            </span>
            <div className={`auth-google-overlay ${googleLoading ? 'auth-google-overlay-loading' : ''}`}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed')}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>
        )}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
