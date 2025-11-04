// src/pages/LandingPage.jsx (full updated file)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // For internal navigation

const LandingPage = () => {
  const [loginLinkText, setLoginLinkText] = useState('Login / Sign Up');
  const [loginLinkPath, setLoginLinkPath] = useState('/user-login'); // Placeholder; adjust if implementing user login

  // Check localStorage for dynamic link (as in original)
  useEffect(() => {
    const current = localStorage.getItem('mh_currentUser');
    if (current) {
      try {
        const u = JSON.parse(current);
        if (u.role === 'admin') {
          setLoginLinkPath('/admin/dashboard');
          setLoginLinkText('Go to Dashboard');
        } else if (u.role === 'seller' && u.status === 'approved') {
          setLoginLinkPath('/seller-dashboard'); // Placeholder
          setLoginLinkText('Go to Dashboard');
        } else {
          setLoginLinkPath('/user-portal'); // Placeholder
          setLoginLinkText('Go to Shop');
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // SVG for Search Icon
  const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 21l-4.35-4.35" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="6" stroke="#94a3b8" strokeWidth="1.5"/>
    </svg>
  );

  return (
    <>
      <div className="container header">
        <div className="brand">
          <div className="logo">MH</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#024b6b' }}>MarketHub</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Buy • Sell • Manage</div>
          </div>
        </div>

        <div className="nav">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link> {/* Placeholder path */}
          <Link to="/about">About</Link> {/* Placeholder */}
          <Link to="/contact">Contact</Link> {/* Placeholder */}
          <div className="search" role="search" title="Search">
            <SearchIcon />
            <input placeholder="Search products..." aria-label="Search products" />
          </div>
          <Link to="/user-portal" style={{ marginLeft: '6px' }}>🛒</Link> {/* Placeholder */}

          <Link 
            to={loginLinkPath} 
            style={{ padding: '8px 12px', background: 'linear-gradient(90deg,#06b6d4,#0ea5e9)', color: '#fff', borderRadius: '8px' }}
          >
            {loginLinkText}
          </Link>
          <Link to="/seller-login" className="btn btn-outline" style={{ padding: '8px 12px', marginLeft: '6px' }}>Sell Here</Link>
          <Link to="/admin/login" className="btn btn-outline" style={{ padding: '8px 12px', marginLeft: '6px' }}>Admin Panel</Link>
        </div>
      </div>

      <div className="container hero">
        <div className="hero-left">
          <h1>Your Gateway to <span style={{ color: '#06b6d4' }}>Digital Commerce</span></h1>
          <p>Connect buyers, sellers and administrators in one powerful platform. Experience seamless e-commerce with intuitive management tools and rich analytics.</p>

          <div className="cta">
            <Link to="/user-portal" className="btn btn-primary">Shop Now ➜</Link> {/* Use Link for no reload */}
            <Link to="/seller-login" className="btn btn-outline">Start Selling</Link>
          </div>

          <div className="features">
            <div className="feature">✅ Secure</div>
            <div className="feature">🚚 Fast Delivery</div>
            <div className="feature">🌟 Top Rated</div>
          </div>

          <div className="cred">Built with ❤️ — demo project. Click **Admin Panel** to try the admin features.</div>
        </div>

        <div className="hero-card">
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=4e6b0f9373a3b0a85f5a2372975aeab4" 
              alt="ecommerce hero"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Fast, modern e-commerce</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>One place to manage products, orders & users.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/admin/login" className="btn-outline" style={{ textDecoration: 'none' }}>Admin</Link>
              <Link to="/user-portal" className="btn btn-primary">Shop</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;