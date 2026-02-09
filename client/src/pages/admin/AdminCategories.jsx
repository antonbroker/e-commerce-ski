import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../services/categoryService'

/**
 * Admin Categories Page - category management
 *
 * Features:
 * - List all categories in a table
 * - Add new category
 * - Edit category (Update button → editable input)
 * - Delete category
 */

function AdminCategories() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const { categories } = await getAllCategories()
      setCategories(categories)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    try {
      setError('')
      await createCategory(newCategoryName.trim())
      setNewCategoryName('')
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category')
    }
  }

  const handleStartEdit = (category) => {
    setEditingId(category._id)
    setEditingName(category.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleUpdateCategory = async (categoryId) => {
    if (!editingName.trim()) {
      setError('Category name is required')
      return
    }

    try {
      setError('')
      await updateCategory(categoryId, editingName.trim())
      setEditingId(null)
      setEditingName('')
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category')
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      setError('')
      await deleteCategory(categoryId)
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category')
    }
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="admin-page admin-categories-page">
      <div className="admin-categories-card">
        <h1>Categories Management</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Add Category Form */}
      <form onSubmit={handleCreateCategory} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              flex: 1,
              maxWidth: '300px'
            }}
          />
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            Add Category
          </button>
        </div>
      </form>

      {/* Categories Table */}
      {loading && categories.length === 0 ? (
        <p className="loading-state">Loading categories...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created At</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No categories yet. Add your first category above.
                  </td>
                </tr>
              ) : (
              categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    {editingId === category._id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="form-group input"
                        style={{
                          width: '100%',
                          maxWidth: '300px'
                        }}
                        autoFocus
                      />
                    ) : (
                      <span>{category.name}</span>
                    )}
                  </td>
                  <td style={{ color: '#666' }}>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {editingId === category._id ? (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleUpdateCategory(category._id)}
                          className="admin-btn admin-btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="admin-btn admin-btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleStartEdit(category)}
                          className="admin-btn admin-btn-secondary"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="admin-btn admin-btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  )
}

export default AdminCategories
