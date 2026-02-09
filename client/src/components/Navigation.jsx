import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { clearCart } from '../store/slices/cartSlice'

/**
 * Navigation - Home link, role links, user dropdown with Logout
 */

function Navigation() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = () => {
    setUserMenuOpen(false)
    dispatch(clearCart())
    dispatch(logout())
    navigate('/login')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const isAdmin = user.role === 'admin'
  const isActive = (path) => location.pathname === path
  const isHome = location.pathname === '/'
  const initials = [user.firstName, user.lastName].map((s) => (s || '').charAt(0)).join('').toUpperCase() || '?'

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <Link to="/" className="navigation-logo">
          Ski Shop
        </Link>

        <div className="navigation-links">
          {!isAdmin && (
            <Link
              to="/"
              className={`navigation-link ${isHome ? 'active' : ''}`}
            >
              Home
            </Link>
          )}
          {isAdmin ? (
            <>
              <Link to="/admin/categories" className={`navigation-link ${isActive('/admin/categories') ? 'active' : ''}`}>
                Categories
              </Link>
              <Link
                to="/admin/products"
                className={`navigation-link ${isActive('/admin/products') ? 'active' : ''}`}
                onClick={(e) => {
                  if (location.pathname === '/admin/products') {
                    e.preventDefault()
                    navigate('/admin/products', { state: { resetProducts: true } })
                  }
                }}
              >
                Products
              </Link>
              <Link to="/admin/statistics" className={`navigation-link ${isActive('/admin/statistics') ? 'active' : ''}`}>
                Statistics
              </Link>
              <Link to="/admin/customers" className={`navigation-link ${isActive('/admin/customers') ? 'active' : ''}`}>
                Customers
              </Link>
              <Link to="/account" className={`navigation-link ${isActive('/account') ? 'active' : ''}`}>
                My Account
              </Link>
            </>
          ) : (
            <>
              <Link to="/catalog" className={`navigation-link ${isActive('/catalog') ? 'active' : ''}`}>
                Catalog
              </Link>
              <Link to="/orders" className={`navigation-link ${isActive('/orders') ? 'active' : ''}`}>
                My Orders
              </Link>
              <Link to="/account" className={`navigation-link ${isActive('/account') ? 'active' : ''}`}>
                My Account
              </Link>
            </>
          )}
        </div>

        <div className="navigation-right">
          {!isAdmin && (
            <Link
              to="/cart"
              className={`navigation-link navigation-cart-link ${isActive('/cart') ? 'active' : ''}`}
              title="Cart"
            >
              🛒
              {totalItems > 0 && (
                <span className="navigation-cart-badge">{totalItems}</span>
              )}
            </Link>
          )}
          <div className="navigation-user" ref={userMenuRef}>
          <button
            type="button"
            className="navigation-user-trigger"
            onClick={() => setUserMenuOpen((open) => !open)}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <span className="navigation-user-initials">{initials}</span>
          </button>
          {userMenuOpen && (
            <div className="navigation-user-dropdown">
              <div className="navigation-user-dropdown-name">
                {user.firstName} {user.lastName}
              </div>
              {user.email && (
                <div className="navigation-user-dropdown-email">{user.email}</div>
              )}
              <button type="button" onClick={handleLogout} className="navigation-logout-btn">
                Logout
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
