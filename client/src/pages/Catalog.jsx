import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getAllProducts, getFilterOptions } from '../services/productService'
import { getAllCategories } from '../services/categoryService'
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice'
import RangeSlider from '../components/filters/RangeSlider'

/** Thumb URL for catalog: /img/... -> /img/thumbs/....webp (smaller, faster). */
function getCatalogThumbUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl
  if (!imageUrl.includes('/img/')) return imageUrl
  return imageUrl.replace(/\/img\//, '/img/thumbs/').replace(/\.[a-z]+$/i, '.webp')
}

/** Image with placeholder skeleton until loaded (reduces perceived wait in catalog). */
function ProductCardImage({ product, onOpenLightbox }) {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getCatalogThumbUrl(product.imageUrl)
  const displayUrl = thumbUrl !== product.imageUrl ? thumbUrl : product.imageUrl
  return (
    <div
      className={`product-image-wrapper${loaded ? ' image-loaded' : ''}`}
      onClick={() => onOpenLightbox({ url: product.imageUrl, title: product.title })}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenLightbox({ url: product.imageUrl, title: product.title })}
      aria-label={`View larger image of ${product.title}`}
    >
      <div className="product-image-placeholder" aria-hidden="true" />
      <img
        src={displayUrl}
        alt={product.title}
        className="product-image"
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (e.target.src !== product.imageUrl) {
            e.target.onerror = null
            e.target.src = product.imageUrl
            return
          }
          e.target.src = 'https://via.placeholder.com/250x200?text=No+Image'
          setLoaded(true)
        }}
      />
    </div>
  )
}

/**
 * Catalog Page - product catalog
 *
 * Features:
 * - Sidebar with filters on the left (sticky)
 * - Products grid on the right
 * - Accordion sections for filters
 * - Gender chips, Category checkboxes, Price/Length sliders
 */

function Catalog() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { items: cartItems } = useSelector((state) => state.cart)
  const [showOrderThanks, setShowOrderThanks] = useState(!!location.state?.orderSuccess)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [availableBrands, setAvailableBrands] = useState([])
  const [availableColors, setAvailableColors] = useState([])
  const [availableSizes, setAvailableSizes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGender, setSelectedGender] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [lengthRange, setLengthRange] = useState({ min: 140, max: 200 })
  const [selectedSize, setSelectedSize] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  
  const [priceSliderTouched, setPriceSliderTouched] = useState(false)
  const [lengthSliderTouched, setLengthSliderTouched] = useState(false)

  // Sort state
  const [sortBy, setSortBy] = useState('newest') // newest, price-asc, price-desc, name

  // Lightbox: open image on click
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') setLightboxImage(null) }
    if (lightboxImage) window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [lightboxImage])

  // Accordion states (which sections are open)
  const [openSections, setOpenSections] = useState({
    category: true,
    gender: true,
    price: true,
    length: false,
    size: false,
    brand: false,
    color: false
  })

  // Boots / Helmets: show Size filter instead of Length
  const selectedCategoryData = categories.find(c => c._id === selectedCategory)
  const categoryNameLower = selectedCategoryData?.name?.toLowerCase() ?? ''
  const isSizeCategory = categoryNameLower.includes('boot') || categoryNameLower.includes('helmet')
  const isHelmetsCategory = categoryNameLower.includes('helmet')
  const HELMET_SIZES = ['S', 'M', 'L', 'XL']
  const sizeOptions = isHelmetsCategory ? HELMET_SIZES : availableSizes

  // Toggle accordion section
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Clear orderSuccess from location so refresh doesn't show banner again
  useEffect(() => {
    if (location.state?.orderSuccess) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state?.orderSuccess, location.pathname, navigate])

  // Load categories and filter options on mount
  useEffect(() => {
    loadCategories()
    loadFilterOptions()
  }, [])

  const loadCategories = async () => {
    try {
      const { categories } = await getAllCategories()
      setCategories(categories)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const { brands, colors, sizes } = await getFilterOptions()
      setAvailableBrands(brands || [])
      setAvailableColors(colors || [])
      setAvailableSizes(sizes || [])
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      if (selectedGender && selectedGender !== 'all') {
        params.append('gender', selectedGender)
      }
      // Only apply price filter if slider was touched
      if (priceSliderTouched) {
        params.append('minPrice', priceRange.min)
        params.append('maxPrice', priceRange.max)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }
      if (lengthSliderTouched) {
        params.append('minLength', lengthRange.min)
        params.append('maxLength', lengthRange.max)
      }
      if (selectedSize) {
        params.append('size', selectedSize)
      }
      if (selectedBrands.length > 0) {
        params.append('brand', selectedBrands.join(','))
      }
      if (selectedColors.length > 0) {
        params.append('color', selectedColors.join(','))
      }
      
      // Add sort parameter
      if (sortBy) {
        params.append('sort', sortBy)
      }

      const queryString = params.toString()
      const { products } = await getAllProducts(queryString ? `?${queryString}` : '')
      
      setProducts(products)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedGender, priceRange, priceSliderTouched, searchTerm, lengthRange, lengthSliderTouched, selectedSize, selectedBrands, selectedColors, sortBy])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Get cart quantity for a product
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.product._id === productId)
    return cartItem ? cartItem.quantity : 0
  }

  // Cart handlers
  const handleIncreaseQuantity = (product) => {
    const currentQuantity = getCartQuantity(product._id)
    
    if (currentQuantity >= product.stock) {
      alert(`Only ${product.stock} items available in stock`)
      return
    }

    if (currentQuantity === 0) {
      dispatch(addToCart(product))
    } else {
      dispatch(updateQuantity({ productId: product._id, quantity: currentQuantity + 1 }))
    }
  }

  const handleDecreaseQuantity = (product) => {
    const currentQuantity = getCartQuantity(product._id)
    
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ productId: product._id, quantity: currentQuantity - 1 }))
    } else if (currentQuantity === 1) {
      dispatch(removeFromCart(product._id))
    }
  }

  const handleClearFilters = () => {
    setSelectedCategory('')
    setSelectedGender('all')
    setPriceRange({ min: 0, max: 5000 })
    setPriceSliderTouched(false)
    setLengthRange({ min: 140, max: 200 })
    setLengthSliderTouched(false)
    setSelectedSize('')
    setSearchTerm('')
    setSelectedBrands([])
    setSelectedColors([])
  }

  // Handlers for range sliders
  const handlePriceChange = ({ min, max }) => {
    setPriceRange({ min, max })
    setPriceSliderTouched(true)
  }

  const handleLengthChange = ({ min, max }) => {
    setLengthRange({ min, max })
    setLengthSliderTouched(true)
  }

  // Handlers for brand checkboxes
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  // Handlers for color selection
  const handleColorToggle = (color) => {
    setSelectedColors(prev => 
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  // Check if any filters are active
  const hasActiveFilters = selectedCategory || selectedGender !== 'all' || 
    priceSliderTouched || searchTerm || lengthSliderTouched || selectedSize || 
    selectedBrands.length > 0 || selectedColors.length > 0

  return (
    <div className="catalog-page">
      {showOrderThanks && (
        <div className="catalog-order-thanks">
          <p>Thank you for your purchase!</p>
          <button type="button" className="catalog-order-thanks-close" onClick={() => setShowOrderThanks(false)} aria-label="Close">×</button>
        </div>
      )}
      <div className="catalog-layout">
        {/* ========== SIDEBAR FILTERS ========== */}
        <aside className="catalog-sidebar">
          <div className="sidebar-header">
            <h2>Filters</h2>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="clear-all-btn">
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="search-input"
            />
          </div>

          {/* Gender Section */}
          <div className="filter-section">
            <button 
              className="filter-section-header"
              onClick={() => toggleSection('gender')}
            >
              <span>Gender</span>
              <span className={`accordion-icon ${openSections.gender ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openSections.gender && (
              <div className="filter-section-content">
                <div className="gender-chips">
                  {['all', 'men', 'woman'].map(gender => (
                    <button
                      key={gender}
                      className={`gender-chip ${selectedGender === gender ? 'active' : ''}`}
                      onClick={() => setSelectedGender(gender)}
                    >
                      {gender === 'all' ? 'All' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Section */}
          <div className="filter-section">
            <button 
              className="filter-section-header"
              onClick={() => toggleSection('category')}
            >
              <span>Category</span>
              <span className={`accordion-icon ${openSections.category ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openSections.category && (
              <div className="filter-section-content">
                <div className="category-list">
                  <label className="category-item">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    <span>All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat._id} className="category-item">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat._id}
                        onChange={() => setSelectedCategory(cat._id)}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Section */}
          <div className="filter-section">
            <button 
              className="filter-section-header"
              onClick={() => toggleSection('price')}
            >
              <span>Price</span>
              <span className={`accordion-icon ${openSections.price ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openSections.price && (
              <div className="filter-section-content">
                <RangeSlider
                  min={0}
                  max={5000}
                  step={50}
                  minValue={priceRange.min}
                  maxValue={priceRange.max}
                  onChange={handlePriceChange}
                  prefix="$"
                />
              </div>
            )}
          </div>

          {/* Length (skis) or Size (boots) Section */}
          {isSizeCategory ? (
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('size')}
              >
                <span>Size</span>
                <span className={`accordion-icon ${openSections.size ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {openSections.size && (
                <div className="filter-section-content">
                  {sizeOptions.length === 0 ? (
                    <p className="filter-empty">No sizes available</p>
                  ) : (
                    <div className="gender-chips">
                      {sizeOptions.map(size => (
                        <button
                          key={size}
                          type="button"
                          className={`gender-chip ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="filter-section">
              <button 
                className="filter-section-header"
                onClick={() => toggleSection('length')}
              >
                <span>Length (cm)</span>
                <span className={`accordion-icon ${openSections.length ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {openSections.length && (
                <div className="filter-section-content">
                  <RangeSlider
                    min={140}
                    max={200}
                    step={5}
                    minValue={lengthRange.min}
                    maxValue={lengthRange.max}
                    onChange={handleLengthChange}
                    suffix=" cm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Brand Section */}
          <div className="filter-section">
            <button 
              className="filter-section-header"
              onClick={() => toggleSection('brand')}
            >
              <span>Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`}</span>
              <span className={`accordion-icon ${openSections.brand ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openSections.brand && (
              <div className="filter-section-content">
                {availableBrands.length === 0 ? (
                  <p className="filter-empty">No brands available</p>
                ) : (
                  <div className="brand-list">
                    {availableBrands.map(brand => (
                      <label key={brand} className="brand-item">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Color Section */}
          <div className="filter-section">
            <button 
              className="filter-section-header"
              onClick={() => toggleSection('color')}
            >
              <span>Color {selectedColors.length > 0 && `(${selectedColors.length})`}</span>
              <span className={`accordion-icon ${openSections.color ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {openSections.color && (
              <div className="filter-section-content">
                {availableColors.length === 0 ? (
                  <p className="filter-empty">No colors available</p>
                ) : (
                  <div className="color-swatches">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        className={`color-swatch ${selectedColors.includes(color) ? 'active' : ''}`}
                        onClick={() => handleColorToggle(color)}
                        title={color}
                        style={{ 
                          '--swatch-color': color.toLowerCase() 
                        }}
                      >
                        {selectedColors.includes(color) && <span className="swatch-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <main className="catalog-main">
          {/* Products Header */}
          <div className="catalog-header">
            <div className="catalog-header-top">
              <h1>Products Catalog</h1>
              <div className="catalog-header-controls">
                <span className="products-count">
                  {loading ? 'Loading...' : `${products.length} products`}
                </span>
                <select 
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Applied Filters Bar */}
            {hasActiveFilters && (
              <div className="applied-filters">
                {selectedGender !== 'all' && (
                  <span className="filter-chip">
                    {selectedGender.charAt(0).toUpperCase() + selectedGender.slice(1)}
                    <button onClick={() => setSelectedGender('all')}>×</button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="filter-chip">
                    {categories.find(c => c._id === selectedCategory)?.name || 'Category'}
                    <button onClick={() => setSelectedCategory('')}>×</button>
                  </span>
                )}
                {priceSliderTouched && (
                  <span className="filter-chip">
                    ${priceRange.min} - ${priceRange.max}
                    <button onClick={() => { setPriceSliderTouched(false); setPriceRange({ min: 0, max: 5000 }) }}>×</button>
                  </span>
                )}
                {lengthSliderTouched && (
                  <span className="filter-chip">
                    {lengthRange.min} - {lengthRange.max} cm
                    <button onClick={() => { setLengthSliderTouched(false); setLengthRange({ min: 140, max: 200 }) }}>×</button>
                  </span>
                )}
                {selectedSize && (
                  <span className="filter-chip">
                    Size {selectedSize}
                    <button onClick={() => setSelectedSize('')}>×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-chip">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>×</button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="filter-chip">
                    {brand}
                    <button onClick={() => handleBrandToggle(brand)}>×</button>
                  </span>
                ))}
                {selectedColors.map(color => (
                  <span key={color} className="filter-chip filter-chip-color">
                    <span 
                      className="chip-color-dot" 
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></span>
                    {color}
                    <button onClick={() => handleColorToggle(color)}>×</button>
                  </span>
                ))}
                <button className="clear-all-link" onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="loading-state">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found.</p>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                const cartQuantity = getCartQuantity(product._id)
                
                return (
                  <div key={product._id} className="product-card">
                    <ProductCardImage product={product} onOpenLightbox={setLightboxImage} />

                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-category">
                      {product.category?.name || 'N/A'}
                    </p>
                    <p className="product-price">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>

                    <div className="quantity-controls">
                      <button
                        onClick={() => handleDecreaseQuantity(product)}
                        disabled={cartQuantity === 0}
                        className="quantity-btn quantity-btn-decrease"
                      >
                        −
                      </button>

                      <span className="quantity-display">
                        {cartQuantity}
                      </span>

                      <button
                        onClick={() => handleIncreaseQuantity(product)}
                        disabled={cartQuantity >= product.stock || product.stock === 0}
                        className="quantity-btn quantity-btn-increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox: full-size image on click */}
      {lightboxImage && (
        <div
          className="catalog-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="button"
          tabIndex={0}
          aria-label="Close"
        >
          <div className="catalog-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage.url} alt={lightboxImage.title} />
            <p className="catalog-lightbox-title">{lightboxImage.title}</p>
            <button type="button" className="catalog-lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Close">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Catalog
