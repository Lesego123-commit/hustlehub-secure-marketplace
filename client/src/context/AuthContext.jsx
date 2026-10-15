// src/context/AuthContext.jsx — Authentication Context Provider
// Manages global authentication state using React Context API. Provides login,
// logout, and register functions with JWT token persistence in localStorage.
//
// React Context API: https://react.dev/reference/react/createContext
// React useContext: https://react.dev/reference/react/useContext
// React useState: https://react.dev/reference/react/useState
// React useEffect: https://react.dev/reference/react/useEffect
// React useCallback: https://react.dev/reference/react/useCallback
// OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
// MDN Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
      role,
    });
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated,
    isFreelancer,
    isClient,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
