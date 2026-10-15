// src/components/Navbar.jsx — Navigation Bar Component
// Renders a responsive navigation bar with role-based links. Freelancers see
// gig management and income links; clients see booking-oriented navigation.
//
// React Router NavLink: https://reactrouter.com/en/main/components/nav-link
// React Router useNavigate: https://reactrouter.com/en/main/hooks/use-navigate
// React conditional rendering: https://react.dev/learn/conditional-rendering
// WAI-ARIA Navigation: https://www.w3.org/WAI/ARIA/apg/patterns/navigation/

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isFreelancer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        Hustle<span>Hub+</span>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/gigs"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Browse Gigs
        </NavLink>

        {isFreelancer && (
          <>
            <NavLink
              to="/gigs/my"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              My Gigs
            </NavLink>
            <NavLink
              to="/gigs/create"
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              Create Gig
            </NavLink>
          </>
        )}

        <NavLink
          to="/bookings"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Bookings
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          Transactions
        </NavLink>

        {isFreelancer && (
          <NavLink
            to="/income"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Income
          </NavLink>
        )}
      </div>

      <div className="navbar-user">
        <div className="navbar-user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
