// src/pages/IncomeDashboard.jsx — Freelancer Income Dashboard
// Displays total income, estimated tax (25%), net income, and a monthly
// breakdown with a CSS-based bar chart (no external chart library).
//
// React useEffect: https://react.dev/reference/react/useEffect
// React useState: https://react.dev/reference/react/useState
// Axios GET requests: https://axios-http.com/docs/get
// CSS bar chart technique: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout
// Number.toFixed: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
// Math.max: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max

import { useState, useEffect } from 'react';
import api from '../api/axios';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function IncomeDashboard() {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    try {
      const response = await api.get('/api/transactions/income');
      setIncomeData(response.data.data);
    } catch (err) {
      setError('Failed to load income data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading income data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const totalIncome = incomeData?.totalIncome || 0;
  const taxRate = incomeData?.taxRate || 0.25;
  const estimatedTax = incomeData?.estimatedTax || totalIncome * taxRate;
  const netIncome = totalIncome - estimatedTax;
  const monthlyBreakdown = incomeData?.monthlyBreakdown || [];

  // Calculate the maximum monthly amount for bar chart scaling
  const maxMonthly = Math.max(
    ...monthlyBreakdown.map((m) => m.total || m.amount || 0),
    1
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Income Dashboard</h1>
      </div>

      {/* Summary Cards */}
      <div className="income-summary">
        <div className="income-card total">
          <h3>Total Income</h3>
          <div className="amount">R{totalIncome.toFixed(2)}</div>
        </div>
        <div className="income-card tax">
          <h3>Estimated Tax ({(taxRate * 100).toFixed(0)}%)</h3>
          <div className="amount">R{estimatedTax.toFixed(2)}</div>
        </div>
        <div className="income-card net">
          <h3>Net Income</h3>
          <div className="amount">R{netIncome.toFixed(2)}</div>
        </div>
      </div>

      {/* Bar Chart */}
      {monthlyBreakdown.length > 0 && (
        <div className="chart-container">
          <h3>Monthly Income Breakdown</h3>
          <div className="bar-chart">
            {monthlyBreakdown.map((month, index) => {
              const amount = month.total || month.amount || 0;
              const heightPercent = (amount / maxMonthly) * 100;
              const label =
                month.month ||
                (month._id?.month
                  ? MONTH_NAMES[month._id.month - 1]
                  : MONTH_NAMES[index] || `M${index + 1}`);

              return (
                <div className="bar-item" key={index}>
                  <span className="bar-value">R{amount.toFixed(0)}</span>
                  <div
                    className="bar"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    title={`${label}: R${amount.toFixed(2)}`}
                  ></div>
                  <span className="bar-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Table */}
      {monthlyBreakdown.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Estimated Tax</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {monthlyBreakdown.map((month, index) => {
              const amount = month.total || month.amount || 0;
              const monthTax = amount * taxRate;
              const monthNet = amount - monthTax;
              const label =
                month.month ||
                (month._id?.month
                  ? MONTH_NAMES[month._id.month - 1]
                  : MONTH_NAMES[index] || `Month ${index + 1}`);

              return (
                <tr key={index}>
                  <td>{label}</td>
                  <td style={{ fontWeight: 600 }}>R{amount.toFixed(2)}</td>
                  <td style={{ color: '#dc3545' }}>R{monthTax.toFixed(2)}</td>
                  <td style={{ color: '#28a745', fontWeight: 600 }}>
                    R{monthNet.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {monthlyBreakdown.length === 0 && (
        <div className="empty-state">
          <h3>No income data yet</h3>
          <p>Your monthly earnings breakdown will appear here once you receive bookings.</p>
        </div>
      )}
    </div>
  );
}

export default IncomeDashboard;
