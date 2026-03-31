const API = '/api';

function getAuthHeaders() {
  const userInfo = localStorage.getItem('userInfo');
  const headers = { 'Content-Type': 'application/json' };
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function getInvoices() {
  const res = await fetch(`${API}/invoices`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let message = `Failed to fetch invoices (${res.status})`;
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getInvoice(id) {
  const res = await fetch(`${API}/invoices/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    let message = `Failed to fetch invoice (${res.status})`;
    try {
      const json = await res.json();
      if (json?.message) message = json.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

export async function createInvoice(data) {
  const res = await fetch(`${API}/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create invoice');
  return json;
}

export async function updateInvoice(id, data) {
  const res = await fetch(`${API}/invoices/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update invoice');
  return json;
}

export async function deleteInvoice(id) {
  const res = await fetch(`${API}/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
  return res.json();
}
