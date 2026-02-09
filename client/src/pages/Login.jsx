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
              {googleLoading ? 'Signing in…' : 'Continue with Google'}
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
