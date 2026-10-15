// src/pages/MyGigs.jsx — Freelancer's Gig Listings Page
// Displays the logged-in freelancer's own gigs with edit and delete controls.
// Includes a confirmation dialog before gig deletion.
//
// React useEffect: https://react.dev/reference/react/useEffect
// React useState: https://react.dev/reference/react/useState
// React Router Link: https://reactrouter.com/en/main/components/link
// Axios DELETE requests: https://axios-http.com/docs/delete
// MDN Window.confirm: https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    try {
      const response = await api.get('/api/gigs/my/listings');
      setGigs(response.data.data.gigs || []);
    } catch (err) {
      setError('Failed to load your gigs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      await api.delete(`/api/gigs/${deleteTarget._id}`);
      setGigs((prev) => prev.filter((g) => g._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete gig. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading your gigs...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Gigs</h1>
        <Link to="/gigs/create" className="btn btn-primary">
          + Create New Gig
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {gigs.length === 0 ? (
        <div className="empty-state">
          <h3>No gigs yet</h3>
          <p>Start offering your services by creating your first gig.</p>
          <Link to="/gigs/create" className="btn btn-primary">
            Create Your First Gig
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {gigs.map((gig) => (
            <div className="card" key={gig._id}>
              <div className="card-header">
                <h3 className="card-title">{gig.title}</h3>
                <span className="category-badge">{gig.category}</span>
              </div>
              <p className="card-description">
                {gig.description?.length > 120
                  ? gig.description.substring(0, 120) + '...'
                  : gig.description}
              </p>
              <div className="card-meta">
                <span className="card-price">R{gig.price}</span>
                <span>Delivery: {gig.deliveryTime} days</span>
              </div>
              <div className="card-actions">
                <Link
                  to={`/gigs/edit/${gig._id}`}
                  className="btn btn-outline btn-sm"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setDeleteTarget(gig)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleteLoading && setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Gig</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGigs;
