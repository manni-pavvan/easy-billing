import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalClients: 0,
    pendingInvoices: 0,
    paidInvoices: 0
  });

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch('/api/dashboard/stats', {
      headers,
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const totalInvoices = (stats.pendingInvoices || 0) + (stats.paidInvoices || 0);

  return (
    <>
      <div className="header-badge">
        <div className="badge-icon">📄</div>
        <div className="badge-text">Easy Billing</div>
      </div>
      <section className="hero-section">
        <h1>Simple Invoice Generator</h1>
        <p className="subtitle">
          Create professional invoices in seconds. Manage your billing<br />
          effortlessly with our easy-to-use platform.
        </p>
        <div className="cta-buttons">
          <Link to="/create-invoice" className="btn btn-primary">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Create Invoice
          </Link>
          <Link to="/invoice-history" className="btn btn-secondary">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Past Bills
          </Link>
        </div>
      </section>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${stats.totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">💵</div>
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{totalInvoices}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-label">Active Clients</div>
          <div className="stat-value">{stats.totalClients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-label">Pending Invoices</div>
          <div className="stat-value">{stats.pendingInvoices}</div>
        </div>
      </div>
      <section className="features-section">
        <h2 className="features-title">Everything You Need for Billing</h2>
        <p className="features-subtitle">Powerful features to streamline your invoicing workflow</p>
      </section>
    </>
  );
}
