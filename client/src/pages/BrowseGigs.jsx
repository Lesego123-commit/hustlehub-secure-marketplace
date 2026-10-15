// src/pages/BrowseGigs.jsx — Browse All Gigs Page
// Fetches and displays all available gigs as cards with category filtering.
// Clients can book gigs directly via a confirmation dialog.
//
// React useEffect: https://react.dev/reference/react/useEffect
// React useState: https://react.dev/reference/react/useState
// Axios GET requests: https://axios-http.com/docs/get
// Array.prototype.filter: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// WAI-ARIA Dialog: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function BrowseGigs() {
  const { isClient } = useAuth();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [bookingGig, setBookingGig] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const response = await api.get('/api/gigs');
      setGigs(response.data.data.gigs || []);
    } catch (err) {
      setError('Failed to load gigs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingGig) return;
    setBookingLoading(true);
    setBookingMessage('');

    try {
      await api.post('/api/bookings', { gigId: bookingGig._id });
      setBookingMessage('Booking confirmed successfully!');
      setTimeout(() => {
        setBookingGig(null);
        setBookingMessage('');
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Booking failed. Please try again.';
      setBookingMessage(message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Extract unique categories from gig data
  const categories = [...new Set(gigs.map((g) => g.category).filter(Boolean))];

  // Filter gigs by selected category
  const filteredGigs = category
    ? gigs.filter((g) => g.category === category)
    : gigs;

  const truncate = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading gigs...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Gigs</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>
          {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {filteredGigs.length === 0 ? (
        <div className="empty-state">
          <h3>No gigs found</h3>
          <p>
            {category
              ? 'No gigs match the selected category. Try a different filter.'
              : 'No gigs are available at the moment. Check back later!'}
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredGigs.map((gig) => (
            <div className="card" key={gig._id}>
              <div className="card-header">
                <h3 className="card-title">{gig.title}</h3>
                <span className="category-badge">{gig.category}</span>
              </div>
              <p className="card-description">{truncate(gig.description)}</p>
              <div className="card-meta">
                <span>Delivery: {gig.deliveryTime} days</span>
                <span>
                  By: {gig.freelancer?.name || gig.user?.name || 'Unknown'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className="card-price">R{gig.price}</span>
                {isClient && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setBookingGig(gig)}
                  >
                    Book Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {bookingGig && (
        <div className="modal-overlay" onClick={() => !bookingLoading && setBookingGig(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Booking</h3>
            <p>
              You are about to book <strong>{bookingGig.title}</strong> for{' '}
              <strong>R{bookingGig.price}</strong>. This action will create a
              booking and process a payment transaction.
            </p>

            {bookingMessage && (
              <div
                className={`alert ${
                  bookingMessage.includes('success')
                    ? 'alert-success'
                    : 'alert-error'
                }`}
              >
                {bookingMessage}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setBookingGig(null)}
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleBook}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseGigs;
