import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'

/**
 * Home Page - main page for logged-in users
 * Light, minimal layout with About section
 */

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const featuresRef = useRef(null)
  const [featuresInView, setFeaturesInView] = useState(false)
  const aboutRef = useRef(null)
  const [aboutInView, setAboutInView] = useState(false)

  useEffect(() => {
    if (location.hash === '#about') {
      const el = document.getElementById('about')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  useEffect(() => {
    const el = aboutRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAboutInView(true)
      },
      { threshold: 0.15, rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = featuresRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFeaturesInView(true)
      },
      { threshold: 0.2, rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <div className="home-page">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1>Not authenticated</h1>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    )
  }

  const isAdmin = user.role === 'admin'
  const userName = `${user.firstName} ${user.lastName}`

  return (
    <div className="home-page">
      {/* Hero Section: background + snowboarder slides in, greeting and buttons appear together */}
      <section className="hero-section">
        <img src="/img/snowbordist.png" alt="" className="hero-snowboarder" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-greeting">Welcome Back</div>
          <h1 className="hero-title">{userName}</h1>
          <p className="hero-subtitle">Your mountain adventure awaits — find your perfect gear and hit the slopes.</p>
          <div className="hero-cta">
            {isAdmin ? (
              <>
                <Link to="/admin/products" className="cta-button cta-primary">
                  Manage Products
                </Link>
                <Link to="/admin/categories" className="cta-button cta-secondary">
                  Manage Categories
                </Link>
              </>
            ) : (
              <>
                <Link to="/catalog" className="cta-button cta-primary">
                  Explore Catalog
                </Link>
                <Link to="/orders" className="cta-button cta-secondary">
                  My Orders
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} id="about" className={`about-section${aboutInView ? ' in-view' : ''}`}>
        <div className="about-content">
          <div className="about-line">
            <h2>About us</h2>
          </div>
          <div className="about-line">
            <p>
          We are a specialist store for winter sports equipment and apparel. Our team selects
          quality gear from trusted brands so you can focus on the slopes. Whether you are
          starting out or upgrading your kit, we are here to help.
        </p>
          </div>
          <div className="about-line">
            <p>
          We work with leading names in skiing and snowboarding — from skis and boots to
          jackets, goggles, and accessories. Every product is chosen for durability, performance,
          and value. Our buyers test gear in real conditions so we can stand behind what we sell.
        </p>
          </div>
          <div className="about-line">
            <p>
          Fast shipping, expert advice, and a straightforward returns policy. We want every
          customer to find the right equipment and enjoy the season. Need help with sizing or
          choosing between models? Our support team is ready to answer your questions and
          recommend the best options for your level and style.
        </p>
          </div>
          <div className="about-line">
            <p>
          We stock equipment for alpine skiing, touring, freestyle, and snowboarding. From
          children’s first skis to race-ready gear, we aim to have something for every ambition
          and budget. New arrivals and seasonal offers are updated regularly so you can plan
          your next trip with confidence.
        </p>
          </div>
          <div className="about-line">
            <p>
          We believe that getting outside in winter should be easy and fun. That is why we keep
          our site simple, our prices clear, and our service reliable. We are a small team of
          enthusiasts who care about the sport and about every order that leaves our warehouse.
        </p>
          </div>
          <div className="about-line">
            <p>
          Thank you for choosing us — we hope to see you on the mountain. If you have any
          questions or feedback, we would love to hear from you.
        </p>
          </div>
        </div>
        <div className="about-stats">
          <div className="stat-card about-stat-item">
            <div className="stat-number">250+</div>
            <div className="stat-label">Products</div>
          </div>
          <div className="stat-card about-stat-item">
            <div className="stat-number">4.9</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-card about-stat-item">
            <div className="stat-number">24h</div>
            <div className="stat-label">Delivery</div>
          </div>
          <div className="stat-card about-stat-item">
            <div className="stat-number">15K+</div>
            <div className="stat-label">Happy Skiers</div>
          </div>
        </div>
      </section>

      {/* Features Section — full-size background, skiers appear on scroll */}
      <section ref={featuresRef} className={`features-section${featuresInView ? ' in-view' : ''}`}>
        <img src="/img/skiers.png" alt="" className="features-skiers" aria-hidden="true" />
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">Premium gear for your mountain adventures</p>
        <div className="features-grid">
          <div className="feature-card">
            <h3 className="feature-title">Premium Selection</h3>
            <p className="feature-description">Curated collection of top ski brands and equipment. From beginners to professionals, we have everything you need.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Expert Guidance</h3>
            <p className="feature-description">Our team of experienced skiers helps you choose the perfect gear for your style and skill level.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Fast Shipping</h3>
            <p className="feature-description">Express delivery to get you on the slopes faster. Free shipping on orders over $200.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Quality Guarantee</h3>
            <p className="feature-description">All products backed by manufacturer warranty. 30-day return policy for complete peace of mind.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Loyalty Rewards</h3>
            <p className="feature-description">Earn points with every purchase. Exclusive deals and early access to new collections.</p>
          </div>
          <div className="feature-card">
            <h3 className="feature-title">Community</h3>
            <p className="feature-description">Join thousands of passionate skiers. Share experiences, tips, and connect with fellow enthusiasts.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
