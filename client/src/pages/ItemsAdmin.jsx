import { useEffect, useMemo, useState } from 'react';
import { getItems, createItem, updateItem, deleteItem } from '../api/items';

export default function ItemsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const sortedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return [...items].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getItems()
      .then((data) => {
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Failed to load items');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const price = Number(unitPrice);

    if (!trimmedName) {
      setError('Item name is required');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Unit price must be a valid number (0 or more)');
      return;
    }

    setSaving(true);
    try {
      const created = await createItem({ name: trimmedName, unitPrice: price });
      setItems((prev) => [created, ...prev]);
      setName('');
      setUnitPrice('');
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
    setEditPrice(item.unitPrice);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim() || editPrice === '' || Number(editPrice) < 0) {
      setError('Valid name and price are required to update');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateItem(id, { name: editName.trim(), unitPrice: Number(editPrice) });
      setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setSaving(true);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-8 text-gray-500">Loading items/services...</p>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Items & Services</h1>
        <p className="subtitle">Add services/items and their unit prices</p>
      </div>

      <div className="form-section" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>
          Add New Item
        </h2>

        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rice"
              />
            </div>
            <div className="form-group">
              <label>Unit Price</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="e.g. 60"
                min={0}
                step="0.01"
              />
            </div>
          </div>

          <div className="action-buttons" style={{ marginBottom: 0 }}>
            <button type="submit" className="btn-action btn-success" disabled={saving}>
              {saving ? 'Saving…' : '+ Add Item'}
            </button>
          </div>

          {error && <p style={{ color: '#DC2626', marginTop: '1rem' }}>{error}</p>}
        </form>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'right' }}>Unit Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-8 text-gray-500">
                  No items yet.
                </td>
              </tr>
            ) : (
              sortedItems.map((it) => (
                <tr key={it._id}>
                  {editingId === it._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ width: '100%', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          min={0}
                          step="0.01"
                          style={{ width: '100px', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-action btn-success"
                          style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem', fontSize: '0.85rem' }}
                          onClick={() => handleUpdate(it._id)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="add-item-btn"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div className="font-medium">{it.name}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹{Number(it.unitPrice).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="add-item-btn"
                          style={{ padding: '0.3rem 0.6rem', marginRight: '0.5rem', fontSize: '0.85rem' }}
                          onClick={() => handleEditClick(it)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="delete-btn"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={() => handleDelete(it._id)}
                          disabled={saving}
                        >
                          🗑
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

