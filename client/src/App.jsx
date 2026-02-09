import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import AdminCategories from './pages/admin/AdminCategories'
import AdminProducts from './pages/admin/AdminProducts'
import AdminStatistics from './pages/admin/AdminStatistics'
import AdminCustomers from './pages/admin/AdminCustomers'
import Orders from './pages/Orders'
import Account from './pages/Account'
import CartPage from './pages/CartPage'
import AuthInitializer from './components/AuthInitializer'
import Cart from './components/Cart'
import Navigation from './components/Navigation'

/**
 * App - main application component
 * Sets up routing (navigation between pages)
 */

function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth)

  // While loading user from token, show loading
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Home - redirect based on auth */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
      />
      
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Customer routes */}
      <Route 
        path="/catalog" 
        element={
          isAuthenticated 
            ? <Catalog /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/orders" 
        element={
          isAuthenticated 
            ? <Orders /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/cart" 
        element={
          isAuthenticated 
            ? <CartPage /> 
            : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/account" 
        element={
          isAuthenticated 
            ? <Account /> 
            : <Navigate to="/login" replace />
        } 
      />
      
      {/* Admin routes - admin only */}
      <Route 
        path="/admin/categories" 
        element={
          isAuthenticated && user?.role === 'admin' 
            ? <AdminCategories /> 
            : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          isAuthenticated && user?.role === 'admin' 
            ? <AdminProducts /> 
            : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/admin/statistics" 
        element={
          isAuthenticated && user?.role === 'admin' 
            ? <AdminStatistics /> 
            : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/admin/customers" 
        element={
          isAuthenticated && user?.role === 'admin' 
            ? <AdminCustomers /> 
            : <Navigate to="/" replace />
        } 
      />
    </Routes>
  )
}

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  return (
    <AuthInitializer>
      <Router>
        <div className="app">
          {/* Navigation shown only for authenticated users */}
          {isAuthenticated && <Navigation />}
          <AppRoutes />
          {/* Cart for customer only; hidden for admin */}
          {isAuthenticated && user?.role !== 'admin' && <Cart />}
        </div>
      </Router>
    </AuthInitializer>
  )
}

export default App
