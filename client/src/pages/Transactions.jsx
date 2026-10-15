// src/pages/Transactions.jsx — Transaction History Page
// Fetches and displays all transactions for the authenticated user in a
// styled data table with type and status badges.
//
// React useEffect: https://react.dev/reference/react/useEffect
// React useState: https://react.dev/reference/react/useState
// Axios GET requests: https://axios-http.com/docs/get
// HTML table element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table
// Date formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
// Number formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed

import { useState, useEffect } from 'react';
import api from '../api/axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/api/transactions');
      setTransactions(response.data.data.transactions || []);
    } catch (err) {
      setError('Failed to load transactions. Please try again later.');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeClass = (type) => {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'payment' || t === 'credit') return 'status-payment';
    if (t === 'refund' || t === 'debit') return 'status-refund';
    return '';
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      completed: 'status-completed',
      confirmed: 'status-confirmed',
      failed: 'status-cancelled',
      cancelled: 'status-cancelled',
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading transactions...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Transaction History</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {transactions.length === 0 ? (
        <div className="empty-state">
          <h3>No transactions yet</h3>
          <p>Your payment history will appear here once you make or receive a booking.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{formatDate(tx.createdAt)}</td>
                <td>{tx.description || 'Transaction'}</td>
                <td style={{ fontWeight: 600 }}>R{Number(tx.amount).toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getTypeClass(tx.type)}`}>
                    {tx.type || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(tx.status)}`}>
                    {tx.status || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Transactions;
