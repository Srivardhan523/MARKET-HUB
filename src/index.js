// src/main.jsx (or src/index.js for Create React App)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Import the root App component (with routing)
import './styles.css';   // Import the global CSS file

// Create the root and render the App in Strict Mode
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);