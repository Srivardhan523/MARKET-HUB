import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>404 - Page Not Found</h2>
            <a href="/" style={{ color: '#0066cc' }}>Go back to Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
