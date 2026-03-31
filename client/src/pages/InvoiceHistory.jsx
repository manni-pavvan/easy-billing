import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices } from '../api/invoices';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(n) {
  return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }) {
  const c = status === 'paid' ? 'status-paid' : status === 'overdue' ? 'status-overdue' : 'status-pending';
  return <span className={`status ${c}`}>{status || 'pending'}</span>;
}

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getInvoices()
      .then((data) => { if (!cancelled) setInvoices(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleMarkPaid = async (id) => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;

      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'paid' }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      // Update local state
      setInvoices(invoices.map(inv => inv._id === id ? { ...inv, status: 'paid' } : inv));
    } catch (err) {
      console.error(err);
      alert('Error updating invoice status');
    }
  };

  if (loading) {
    return (
      <>
        <header>
          <h1>Invoice History</h1>
        </header>
        <p className="text-gray-500">Loading invoices…</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <h1>Invoice History</h1>
          <Link to="/create-invoice" className="btn">+ Create Invoice</Link>
        </header>
        <p className="text-red-600">{error}</p>
        <p className="text-gray-500 mt-2">Make sure the backend is running on port 5000 and MongoDB is connected.</p>
      </>
    );
  }

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Invoice History</h1>
        <Link to="/create-invoice" className="btn">+ Create Invoice</Link>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-500">
                  No invoices yet. <Link to="/create-invoice" className="text-primary hover-underline">Create your first invoice</Link>.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id}>
                  <td className="invoice-number font-medium">{inv.invoiceNumber}</td>
                  <td>{inv.customerName}</td>
                  <td>{formatDate(inv.invoiceDate)}</td>
                  <td className="amount font-medium">{formatAmount(inv.grandTotal)}</td>
                  <td><StatusBadge status={inv.status} /></td>
                  <td>
                    {inv.status === 'pending' && (
                      <button
                        className="btn-sm btn-outline-success"
                        onClick={() => handleMarkPaid(inv._id)}
                      >
                        ✓ Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
