// src/api/axios.js — Axios HTTP Client Configuration
// Creates a pre-configured Axios instance with JWT authentication interceptors
// and centralized error handling for all API requests.
//
// Axios instance creation: https://axios-http.com/docs/instance
// Axios interceptors: https://axios-http.com/docs/interceptors
// JWT Bearer tokens: https://datatracker.ietf.org/doc/html/rfc6750
// OWASP Session Management: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
// MDN localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
