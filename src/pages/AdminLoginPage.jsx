import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Hardcoded credentials (CHANGE THESE TO YOUR OWN!)
const FIXED_EMAIL = 'yourgmail@gmail.com';   // Replace with your actual Gmail
const FIXED_PASSWORD = 'yourpassword';       // Replace with a password you want

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: 'Enter your Gmail and password to login', color: 'var(--muted)' });
  const navigate = useNavigate();

  const showMsg = (msg, color = 'var(--muted)') => {
    setMessage({ text: msg, color });
  };

  const handleLogin = () => {
    console.log('Login button clicked. Input:', { email, password });

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    if (!inputEmail || !inputPassword) {
      showMsg('Please enter email & password', 'var(--danger)');
      console.error('Missing email or password');
      return;
    }

    if (inputEmail === FIXED_EMAIL.toLowerCase() && inputPassword === FIXED_PASSWORD) {
      showMsg('Login successful — redirecting...', 'var(--success)');
      console.log('Login successful. Preparing redirect.');

      // Save admin user session
      const adminUser = {
        id: 'admin_1',
        name: 'Admin User',
        email: FIXED_EMAIL,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('mh_currentUser', JSON.stringify(adminUser));

      // Redirect
      navigate('/admin/dashboard');
      console.log('Redirect executed.');
    } else {
      showMsg('Invalid credentials. Try again.', 'var(--danger)');
      console.error('Credentials mismatch');
    }
  };

  return (
    <>
      <div className="container header">
        <div className="brand">
          <div className="logo">MH</div>
          <div>
            <div style={{ fontWeight: 800, color: '#024b6b' }}>MarketHub Admin</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Management Access</div>
          </div>
        </div>
        <div className="nav">
          <Link to="/">Home</Link>
          <Link to="/user-login">Buyer Login</Link>
          <Link to="/seller-login">Seller Login</Link>
        </div>
      </div>

      <div className="container auth-wrap">
        <div className="auth-banner">
          <h2 style={{ fontSize: '28px' }}>Admin Panel</h2>
          <p className="small">Secure access to manage all products, users, and orders on MarketHub.</p>

          <div style={{ marginTop: '18px', background: 'linear-gradient(90deg,#0ea5e9,#06b6d4)', padding: '12px', borderRadius: '10px', color: '#fff', boxShadow: 'var(--soft-shadow)' }}>
            <div style={{ fontWeight: 700 }}>Use your Gmail</div>
            <div style={{ fontSize: '13px', marginTop: '6px' }}>
              Enter <strong>{FIXED_EMAIL}</strong> / <strong>{FIXED_PASSWORD}</strong>.
            </div>
          </div>

          <div style={{ marginTop: '16px', color: 'var(--muted)', fontSize: '13px' }}>
            <div>Tip: This is a simplified login for demo.</div>
          </div>
        </div>

        <div className="auth-card">
          <h2>Admin Login</h2>
          <div className="small" style={{ color: message.color, marginBottom: '12px' }}>{message.text}</div>

          <div className="form-row">
            <input
              className="input"
              type="email"
              placeholder="Your Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin}>Login</button>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
