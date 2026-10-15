// src/pages/Bookings.jsx — Bookings List Page
// Displays the authenticated user's bookings as styled cards with status
// badges. Shows different contextual labels for clients vs freelancers.
//
// React useEffect: https://react.dev/reference/react/useEffect
// React useState: https://react.dev/reference/react/useState
// Axios GET requests: https://axios-http.com/docs/get
// Date.prototype.toLocaleDateString: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
// CSS status badges: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_backgrounds_and_borders

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Bookings() {
  const { isFreelancer } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings');
      setBookings(response.data.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Bookings</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No bookings yet</h3>
          <p>
            {isFreelancer
              ? 'Once clients book your gigs, they will appear here.'
              : 'Browse gigs and book a service to get started.'}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {bookings.map((booking) => (
            <div className="card" key={booking._id}>
              <div className="card-header">
                <h3 className="card-title">
                  {booking.gig?.title || 'Untitled Gig'}
                </h3>
                <span
                  className={`status-badge ${getStatusClass(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="card-meta">
                <span>
                  {isFreelancer ? 'Client' : 'Freelancer'}:{' '}
                  {isFreelancer
                    ? booking.client?.name || 'Unknown'
                    : booking.freelancer?.name || 'Unknown'}
                </span>
              </div>

              <div className="card-meta">
                <span>Price: R{booking.gig?.price || booking.price || 0}</span>
                <span>Booked: {formatDate(booking.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bookings;
