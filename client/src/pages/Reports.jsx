import { useState, useEffect } from 'react';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch('/api/dashboard/stats', {
      headers,
    })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-8 text-gray-500">Loading reports...</p>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Detailed analysis of your business performance</p>
      </header>

      {/* Key Metrics */}
      <div className="stats-grid mb-8">
        <div className="stat-card">
          <div className="stat-icon green">📈</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${data?.totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🪙</div>
          <div className="stat-label">Avg. Invoice Value</div>
          <div className="stat-value">${data?.averageInvoiceValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{data?.totalClients}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* Monthly Revenue Chart */}
        <div className="card">
          <h2 className="section-title">Monthly Revenue (Last 6 Months)</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '240px', gap: '1rem', paddingTop: '1rem' }}>
            {data?.monthlyRevenue?.map((item) => {
              const chartHeight = 160; // px
              const maxVal = Math.max(...(data?.monthlyRevenue || []).map(m => Number(m.amount) || 0), 1);
              const value = Number(item.amount) || 0;
              const heightPx = value <= 0 ? 2 : Math.max(4, (value / maxVal) * chartHeight);
              return (
                <div key={item.month} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: `${chartHeight}px`, display: 'flex', alignItems: 'flex-end' }}>
                    <div
                      style={{
                        height: `${heightPx}px`,
                        width: '100%',
                        background: '#4F46E5',
                        borderRadius: '6px',
                        transition: 'height 0.3s ease',
                      }}
                      title={`₹${value.toLocaleString('en-IN')}`}
                    ></div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>{item.month}</div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#1F2937' }}>
                    ₹{value.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clients Table */}
        <div className="card">
          <h2 className="section-title">Top Clients</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th style={{ textAlign: 'right' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {data?.topClients?.length > 0 ? (
                data.topClients.map((client) => (
                  <tr key={client._id}>
                    <td>
                      <div className="font-medium">{client.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{client.email}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>
                      ${client.totalSpent?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', color: '#6B7280' }}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
