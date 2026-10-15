// src/pages/Dashboard.jsx — User Dashboard Page
// Displays a personalised welcome message and role-specific quick-action cards
// for navigating to key features of the platform.
//
// React Router Link: https://reactrouter.com/en/main/components/link
// React conditional rendering: https://react.dev/learn/conditional-rendering
// CSS Grid layout: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, isFreelancer, isClient } = useAuth();

  const clientLinks = [
    {
      title: 'Browse Gigs',
      description: 'Discover talented freelancers and their services.',
      path: '/gigs',
      icon: '🔍',
    },
    {
      title: 'My Bookings',
      description: 'View and manage your active bookings.',
      path: '/bookings',
      icon: '📋',
    },
    {
      title: 'My Transactions',
      description: 'Track your payment history and receipts.',
      path: '/transactions',
      icon: '💳',
    },
  ];

  const freelancerLinks = [
    {
      title: 'My Gigs',
      description: 'Manage your published service listings.',
      path: '/gigs/my',
      icon: '📦',
    },
    {
      title: 'Create Gig',
      description: 'List a new service for clients to discover.',
      path: '/gigs/create',
      icon: '➕',
    },
    {
      title: 'My Bookings',
      description: 'Track orders and manage client requests.',
      path: '/bookings',
      icon: '📋',
    },
    {
      title: 'Income Dashboard',
      description: 'Monitor your earnings and tax estimates.',
      path: '/income',
      icon: '📊',
    },
  ];

  const links = isFreelancer ? freelancerLinks : clientLinks;

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.name}!</h1>
        <p>
          You are logged in as a <strong>{user?.role}</strong>.
          {isClient && ' Find talented freelancers and get your projects done.'}
          {isFreelancer && ' Manage your services and grow your business.'}
        </p>
      </div>

      <div className="dashboard-stats">
        {links.map((item) => (
          <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon">{item.icon}</div>
              <h3>{item.description}</h3>
              <div className="stat-label">{item.title}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
