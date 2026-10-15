// src/App.jsx — Root Application Component
// Defines the route structure with authentication-guarded and role-based routes.
// Wraps the entire application in AuthProvider for global auth state.
//
// React Router Routes: https://reactrouter.com/en/main/components/routes
// React Router Route: https://reactrouter.com/en/main/components/route
// React Router Navigate: https://reactrouter.com/en/main/components/navigate
// React Context Provider pattern: https://react.dev/learn/passing-data-deeply-with-context
// Protected routes: https://reactrouter.com/en/main/start/concepts#authentication

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseGigs from './pages/BrowseGigs';
import CreateGig from './pages/CreateGig';
import EditGig from './pages/EditGig';
import MyGigs from './pages/MyGigs';
import Bookings from './pages/Bookings';
import Transactions from './pages/Transactions';
import IncomeDashboard from './pages/IncomeDashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes — any authenticated user */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs"
          element={
            <PrivateRoute>
              <BrowseGigs />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />

        {/* Freelancer-only routes */}
        <Route
          path="/gigs/create"
          element={
            <PrivateRoute roles={['freelancer']}>
              <CreateGig />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs/edit/:id"
          element={
            <PrivateRoute roles={['freelancer']}>
              <EditGig />
            </PrivateRoute>
          }
        />
        <Route
          path="/gigs/my"
          element={
            <PrivateRoute roles={['freelancer']}>
              <MyGigs />
            </PrivateRoute>
          }
        />
        <Route
          path="/income"
          element={
            <PrivateRoute roles={['freelancer']}>
              <IncomeDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all — redirect unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
