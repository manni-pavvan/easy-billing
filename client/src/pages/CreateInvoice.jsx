import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../api/invoices';
import { getItems } from '../api/items';

const defaultItem = (firstItem) => ({
  itemId: firstItem?._id || '',
  inputValue: firstItem?.name || '',
  quantity: 1,
  unitPrice: firstItem ? Number(firstItem.unitPrice) || 0 : 0,
  total: firstItem ? (1 * (Number(firstItem.unitPrice) || 0)) : 0,
});
const formatNum = (n) => Number(n) || 0;
const toDateStr = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : (d || '').slice(0, 10));

const AutocompleteDropdown = ({ value, onChange, options, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onChange(e.target.value);
        }}
        onFocus={() => setIsOpen(true)}
        disabled={disabled}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '0.4rem',
          boxSizing: 'border-box',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          outline: 'none',
          backgroundColor: disabled ? '#F3F4F6' : '#fff'
        }}
      />
      {isOpen && !disabled && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '150px',
          overflowY: 'auto',
          background: '#fff',
          border: '1px solid #D1D5DB',
          borderRadius: '4px',
          zIndex: 10,
          margin: '2px 0 0 0',
          padding: 0,
          listStyle: 'none',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
        }}>
          {filtered.length > 0 ? filtered.map((opt) => (
            <li
              key={opt._id}
              style={{ padding: '0.4rem 0.5rem', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
              onMouseDown={(e) => {
                e.preventDefault();
                setSearch(opt.name);
                setIsOpen(false);
                onChange(opt.name);
              }}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = '#fff'}
            >
              {opt.name}
            </li>
          )) : (
            <li style={{ padding: '0.4rem 0.5rem', color: '#6B7280' }}>No items found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(toDateStr(new Date()));
  const [invoiceNumber, setInvoiceNumber] = useState(`#INV-${Date.now().toString().slice(-6)}`);
  const [taxPercent, setTaxPercent] = useState(5);
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [items, setItems] = useState([defaultItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError('');

    getItems()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setCatalogItems(list);
      })
      .catch((err) => {
        if (cancelled) return;
        setCatalogError(err.message || 'Failed to load items');
      })
      .finally(() => {
        if (cancelled) return;
        setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (catalogLoading) return;
    if (!catalogItems.length) return;

    // Auto-fill empty rows with the first available catalog item.
    const first = catalogItems[0];
    setItems((prev) =>
      prev.map((it) => {
        if (it.itemId) return it;
        const unitPrice = Number(first.unitPrice) || 0;
        return { ...it, itemId: first._id, inputValue: first.name, unitPrice, total: unitPrice * it.quantity };
      })
    );
  }, [catalogItems, catalogLoading]);

  const updateQuantity = useCallback((index, value) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      const qty = Math.max(1, formatNum(value));
      item.quantity = qty;
      item.total = qty * (Number(item.unitPrice) || 0);
      next[index] = item;
      return next;
    });
  }, []);

  const updateItemName = useCallback((index, value) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index] };
      item.inputValue = value;
      const catalog = catalogItems.find((c) => c.name === value);
      if (catalog) {
        item.itemId = catalog._id;
        item.unitPrice = Number(catalog.unitPrice) || 0;
      } else {
        item.itemId = '';
        item.unitPrice = 0;
      }
      item.total = (Number(item.quantity) || 0) * item.unitPrice;
      next[index] = item;
      return next;
    });
  }, [catalogItems]);

  const addItem = () => {
    const first = catalogItems[0];
    setItems((prev) => [...prev, defaultItem(first)]);
  };
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.unitPrice) || 0)), 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }

    if (catalogItems.length === 0) {
      setError('No items/services configured. Ask the admin to add items first.');
      return;
    }

    if (items.some((i) => !i.itemId)) {
      setError('Please select valid item names for all rows');
      return;
    }
    setSaving(true);
    try {
      await createInvoice({
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim(),
        invoiceNumber: invoiceNumber.trim() || `#INV-${Date.now()}`,
        invoiceDate,
        taxPercent,
        status: 'pending',
        items: items
          .filter((i) => i.itemId)
          .map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
          })),
      });
      navigate('/invoice-history');
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header>
        <div>
          <h1>Create Invoice</h1>
          <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Fill in the details to generate your invoice</p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-title">Customer Details</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                placeholder="Mobile Number"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                placeholder="#INV-1235"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="items-header">
            <h2 className="section-title" style={{ margin: 0 }}>Items & Services</h2>
            <button
              type="button"
              className="add-item-btn"
              onClick={addItem}
              disabled={catalogLoading || !catalogItems.length}
              title={catalogItems.length ? '' : 'Ask the admin to add items/services first'}
            >
              + Add Item
            </button>
          </div>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <AutocompleteDropdown
                      value={item.inputValue}
                      onChange={(val) => updateItemName(i, val)}
                      options={catalogItems}
                      disabled={catalogLoading || !catalogItems.length}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      style={{ width: '80px' }}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(i, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: '100px' }}
                      value={item.unitPrice || ''}
                      disabled
                    />
                  </td>
                  <td className="total-cell">₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                  <td>
                    <button type="button" className="delete-btn" onClick={() => removeItem(i)} aria-label="Remove">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {catalogError && (
          <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{catalogError}</p>
        )}

        {error && (
          <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{error}</p>
        )}

        <div className="action-buttons">
          <button type="submit" className="btn-action btn-success" disabled={saving || catalogLoading}>
            {saving ? 'Saving…' : '💾 Save Invoice'}
          </button>
        </div>

        <div className="summary-section">
          <div className="summary-card">
            <h3 className="chart-title">Invoice Summary</h3>
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Tax ({taxPercent}%)</span>
              <span className="summary-value">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label grand-total">Grand Total</span>
              <span className="summary-value grand-total">₹{grandTotal.toFixed(2)}</span>
            </div>
            <button type="submit" className="generate-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Generate Bill'}
            </button>
          </div>
          <div className="preview-section">
            <h3 className="preview-title">Quick Preview</h3>
            <div className="preview-item">
              <div className="preview-item-label">Customer</div>
              <div className="preview-item-value">{customerName || '—'}</div>
            </div>
            <div className="preview-item">
              <div className="preview-item-label">Items</div>
              <div className="preview-item-value">{items.filter((i) => i.itemId).length} item(s)</div>
            </div>
            <div className="preview-item">
              <div className="preview-item-label">Invoice Number</div>
              <div className="preview-item-value">{invoiceNumber || '—'}</div>
            </div>
            <div className="preview-item">
              <div className="preview-item-label">Total Amount</div>
              <div className="preview-amount">₹{grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
