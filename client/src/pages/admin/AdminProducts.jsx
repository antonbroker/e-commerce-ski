import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../services/productService'
import { getAllCategories } from '../../services/categoryService'

/**
 * Admin Products Page - product management
 *
 * Features:
 * - List all products in a table
 * - Add new product ("Add New" button → empty form)
 * - Edit product
 * - Delete product
 */

function AdminProducts() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [addingNew, setAddingNew] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: '',
    gender: '',
    length: '',
    size: '',
    brand: '',
    color: ''
  })

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  // Load products and categories on mount
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  // Reset edit mode when clicking "Products" in nav (same URL + state)
  useEffect(() => {
    if (location.state?.resetProducts) {
      setAddingNew(false)
      setEditingId(null)
      setFormData({
        title: '', price: '', category: '', imageUrl: '', stock: '', gender: '', length: '', size: '', brand: '', color: ''
      })
      navigate('/admin/products', { replace: true, state: {} })
    }
  }, [location.state?.resetProducts, navigate])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const { products } = await getAllProducts()
      setProducts(products)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { categories } = await getAllCategories()
      setCategories(categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const handleAddNew = () => {
    setAddingNew(true)
    setEditingId(null)
    setFormData({
      title: '',
      price: '',
      category: categories[0]?._id || '',
      imageUrl: '',
      stock: '0',
      gender: '',
      length: '',
      size: '',
      brand: '',
      color: ''
    })
  }

  const handleCancel = () => {
    setAddingNew(false)
    setEditingId(null)
    setFormData({
      title: '',
      price: '',
      category: '',
      imageUrl: '',
      stock: '',
      gender: '',
      length: '',
      size: '',
      brand: '',
      color: ''
    })
  }

  const handleStartEdit = (product) => {
    setEditingId(product._id)
    setAddingNew(false)
    setFormData({
      title: product.title,
      price: product.price.toString(),
      category: product.category._id || product.category,
      imageUrl: product.imageUrl,
      stock: product.stock.toString(),
      gender: product.gender || '',
      length: product.length ? product.length.toString() : '',
      size: product.size ?? '',
      brand: product.brand || '',
      color: product.color || ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.price || !formData.category || !formData.imageUrl) {
      setError('All fields are required')
      return
    }

    try {
      setError('')
      const productData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl.trim(),
        stock: Number(formData.stock) || 0,
        gender: formData.gender || undefined,
        length: formData.length ? Number(formData.length) : undefined,
        size: formData.size?.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        color: formData.color.trim() || undefined
      }

      if (addingNew) {
        await createProduct(productData)
      } else if (editingId) {
        await updateProduct(editingId, productData)
      }

      await loadProducts()
      handleCancel()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      setError('')
      await deleteProduct(productId)
      await loadProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedCategoryName = categories.find(c => c._id === formData.category)?.name?.toLowerCase() ?? ''
  const isSizeCategory = selectedCategoryName.includes('boot') || selectedCategoryName.includes('helmet')
  const isHelmetsCategory = selectedCategoryName.includes('helmet')
  const HELMET_SIZES = ['S', 'M', 'L', 'XL']

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h1 style={{ margin: 0 }}>Products Management</h1>
        {!addingNew && !editingId && (
          <button onClick={handleAddNew} className="add-new-btn">
            Add New
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(addingNew || editingId) && (
        <form onSubmit={handleSubmit} style={{ 
          marginBottom: '30px', 
          padding: '30px', 
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          border: '1px solid #e5e5e5'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            fontFamily: "'Oswald', sans-serif",
            fontSize: '1.8rem',
            color: '#111',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            {addingNew ? 'Add New Product' : 'Edit Product'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>Category:</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Stock:</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Image URL:</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="/img/ski.jpg or https://..."
              required
              style={{ width: '100%' }}
            />
          </div>

          {/* Additional Filters Section */}
          <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            border: '1px solid #e5e5e5'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1.1rem' }}>Additional Filters (Optional)</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div className="form-group">
                <label>Gender:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Not specified</option>
                  <option value="men">Men</option>
                  <option value="woman">Woman</option>
                </select>
              </div>

              {isSizeCategory ? (
                <div className="form-group">
                  <label>Size:</label>
                  {isHelmetsCategory ? (
                    <select
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">Not specified</option>
                      {HELMET_SIZES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      placeholder="e.g., 42 or US 9"
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label>Length (cm):</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.length}
                    onChange={(e) => handleInputChange('length', e.target.value)}
                    placeholder="e.g., 170"
                    style={{ width: '100%' }}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Brand:</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Rossignol"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="e.g., Black"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary">
              {addingNew ? 'Create' : 'Save'}
            </button>
            <button type="button" onClick={handleCancel} className="admin-btn admin-btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      {loading && products.length === 0 ? (
        <p className="loading-state">Loading products...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No products yet. Click "Add New" to create your first product.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50?text=No+Image'
                        }}
                      />
                    </td>
                    <td>{product.title}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      {product.category?.name || 'N/A'}
                    </td>
                    <td>{product.stock}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(product)}
                          disabled={addingNew || !!editingId}
                          className="admin-btn admin-btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          disabled={addingNew || !!editingId}
                          className="admin-btn admin-btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
