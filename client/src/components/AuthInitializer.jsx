import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { restoreUser, setLoading } from '../store/slices/authSlice'
import { restoreCart } from '../store/slices/cartSlice'
import { getMe } from '../services/authService'

/**
 * AuthInitializer - restores user on app load
 *
 * Checks if token exists in sessionStorage
 * If present → requests /api/auth/me and restores user in Redux
 */

function AuthInitializer({ children }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const restoreAuth = async () => {
      const token = sessionStorage.getItem('token')
      
      if (!token) {
        dispatch(setLoading(false))
        return
      }

      try {
        const { user } = await getMe()
        dispatch(restoreUser({ user, token }))
        // Cart is tied to user: key cart_${userId}
        try {
          let savedCart = localStorage.getItem(`cart_${user._id}`)
          if (!savedCart && localStorage.getItem('cart')) {
            savedCart = localStorage.getItem('cart')
            localStorage.removeItem('cart')
          }
          const items = savedCart ? JSON.parse(savedCart) : []
          dispatch(restoreCart({ items, userId: user._id }))
        } catch (e) {
          console.error('Error restoring cart:', e)
          dispatch(restoreCart({ items: [], userId: user._id }))
        }
      } catch (error) {
        console.error('Error restoring user:', error)
        sessionStorage.removeItem('token')
        dispatch(setLoading(false))
      }
    }

    restoreAuth()
  }, [dispatch])

  return children
}

export default AuthInitializer
