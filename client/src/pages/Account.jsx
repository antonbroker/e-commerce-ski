import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateProfile as updateProfileApi } from '../services/authService'
import { updateUser } from '../store/slices/authSlice'

/**
 * Account Page - view and edit own profile
 * Editable: firstName, lastName. Email and username read-only.
 */

function Account() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await updateProfileApi({ firstName: firstName.trim(), lastName: lastName.trim() })
      dispatch(updateUser(data.user))
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <h1>My Account</h1>

        {error && (
          <div className="account-message account-error">{error}</div>
        )}
        {success && (
          <div className="account-message account-success">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label htmlFor="account-email">Email</label>
            <input
              id="account-email"
              type="text"
              value={user.email ?? ''}
              readOnly
              disabled
              className="account-input-readonly"
            />
          </div>
          <div className="form-group">
            <label htmlFor="account-username">Username</label>
            <input
              id="account-username"
              type="text"
              value={user.username ?? ''}
              readOnly
              disabled
              className="account-input-readonly"
            />
          </div>
          <div className="form-group">
            <label htmlFor="account-firstName">First name</label>
            <input
              id="account-firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              minLength={2}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="account-lastName">Last name</label>
            <input
              id="account-lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              minLength={2}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Account
