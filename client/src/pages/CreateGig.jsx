// src/pages/CreateGig.jsx — Create New Gig Page (Freelancer)
// Provides a form for freelancers to create a new service listing with
// validation for all required fields.
//
// React forms: https://react.dev/reference/react-dom/components/form
// React useState: https://react.dev/reference/react/useState
// React Router useNavigate: https://reactrouter.com/en/main/hooks/use-navigate
// Axios POST requests: https://axios-http.com/docs/post
// HTML textarea: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'other', label: 'Other' },
];

function CreateGig() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deliveryTime: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required.';
    if (!formData.description.trim()) return 'Description is required.';
    if (!formData.category) return 'Category is required.';
    if (!formData.price || Number(formData.price) <= 0)
      return 'Price must be a positive number.';
    if (!formData.deliveryTime || Number(formData.deliveryTime) <= 0)
      return 'Delivery time must be a positive number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/gigs', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: Number(formData.price),
        deliveryTime: `${formData.deliveryTime} days`,
      });
      navigate('/gigs/my');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to create gig. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Gig</h1>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Gig Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="e.g., I will build a responsive website"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your service in detail..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (R)</label>
              <input
                id="price"
                type="number"
                name="price"
                placeholder="500"
                min="1"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Delivery Time (days)</label>
              <input
                id="deliveryTime"
                type="number"
                name="deliveryTime"
                placeholder="7"
                min="1"
                value={formData.deliveryTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Gig'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/gigs/my')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGig;
