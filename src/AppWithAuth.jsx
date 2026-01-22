import React, { useState, useEffect } from 'react';
import AuthScreen from './AuthScreen';
import { authAPI } from './api';
import BudgetApp from './BudgetApp';

/**
 * This is a minimal wrapper that adds authentication to your existing app
 * without changing any of your current functionality.
 * 
 * Step 1: Just get login working
 * Step 2: We'll gradually migrate features to use the backend
 */

const AppWithAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      // Check for token in URL (Google OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        localStorage.setItem('auth_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check if user is authenticated
      if (authAPI.isAuthenticated()) {
        try {
          // For now, we'll just trust the token exists
          // In next iteration, we'll actually fetch user profile
          setIsAuthenticated(true);
          setUser({ email: 'user@example.com' }); // Placeholder
        } catch (error) {
          console.error('Auth check failed:', error);
          authAPI.logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    
    // Clear ALL localStorage to prevent data mixing between accounts
    localStorage.clear();
    
    setIsAuthenticated(false);
    setUser(null);
  };

  // Show loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: '700',
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif'
      }}>
        Loading Budget Buddy...
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Show your existing app with a logout button
  return (
    <div>
      {/* Logout button overlay */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1000
      }}>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>👤</span>
          Logout
        </button>
      </div>

      {/* Your existing app - works exactly as before! */}
      <BudgetApp />
    </div>
  );
};

export default AppWithAuth;
