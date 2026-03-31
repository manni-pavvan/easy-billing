import { useState, useEffect } from 'react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;

    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    fetch('/api/clients', {
      headers,
    })
      .then(res => res.json())
      .then(data => {
        setClients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching clients:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;

      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setClients(clients.filter(c => c._id !== id));
      } else {
        alert('Failed to delete client');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting client');
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading clients...</p>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Clients</h1>
        <p className="subtitle">Manage your customer base</p>
      </header>

      <div className="clients-grid">
        {clients.length > 0 ? (
          clients.map(client => (
            <div key={client._id} className="client-card relative group">
              <button
                onClick={() => handleDelete(client._id)}
                className="delete-client-btn"
                title="Delete Client"
              >
                🗑
              </button>
              <div className="client-name">{client.name}</div>
              <div className="client-info">📱 {client.mobile || 'No mobile'}</div>
              <div className="client-info">📧 {client.email || 'No email'}</div>
              <div className="client-status status-active">
                Total Spent: ${client.totalSpent?.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No clients found.</p>
        )}
      </div>
    </div>
  );
}
