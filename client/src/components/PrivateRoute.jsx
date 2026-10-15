// src/components/PrivateRoute.jsx — Protected Route Component
// Guards routes that require authentication. Optionally restricts access by
// user role (e.g., freelancer-only pages). Redirects unauthenticated users
// to the login page.
//
// React Router Navigate: https://reactrouter.com/en/main/components/navigate
// React Router Outlet: https://reactrouter.com/en/main/components/outlet
// Protected routes pattern: https://reactrouter.com/en/main/start/concepts#authentication

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PrivateRoute;
