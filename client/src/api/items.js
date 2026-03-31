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

export async function getItems() {
  const res = await fetch(`${API}/items`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let message = `Failed to fetch items (${res.status})`;
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

export async function createItem({ name, unitPrice }) {
  const res = await fetch(`${API}/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, unitPrice }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create item');
  return json;
}

export async function updateItem(id, { name, unitPrice }) {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, unitPrice }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update item');
  return json;
}

export async function deleteItem(id) {
  const res = await fetch(`${API}/items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete item');
  return json;
}

