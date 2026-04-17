'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, formatDate, getTodayDate, getCurrentMonth } from '@/lib/utils';

interface StockEntryType {
  _id: string;
  date: string;
  type: 'in' | 'out';
  source: string;
  truckNumber: string;
  quantity: number;
  costValue: number;
  description: string;
}

interface StockData {
  entries: StockEntryType[];
  stockValue: number;
  stockQuantity: number;
  totalIn: number;
  totalOut: number;
}

export default function StockPage() {
  const [data, setData] = useState<StockData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [form, setForm] = useState({
    date: getTodayDate(),
    type: 'in' as 'in' | 'out',
    source: 'external_truck' as string,
    truckNumber: '',
    quantity: 0,
    costValue: 0,
    description: '',
  });

  const fetchStock = () => {
    const params = new URLSearchParams();
    if (filterMonth) params.set('month', filterMonth);
    fetch(`/api/stock?${params}`)
      .then(r => r.json())
      .then(setData);
  };

  useEffect(() => { fetchStock(); }, [filterMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ date: getTodayDate(), type: 'in', source: 'external_truck', truckNumber: '', quantity: 0, costValue: 0, description: '' });
      setShowForm(false);
      fetchStock();
    } finally {
      setLoading(false);
    }
  };

  const sourceLabel = (source: string) => {
    switch (source) {
      case 'khadan_truck': return '🚚 खदान गाड़ी';
      case 'external_truck': return '🚐 बाहरी गाड़ी';
      case 'local_truck_purchase': return '🚛 लोकल गाड़ी';
      default: return source;
    }
  };

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>📦 स्टॉक (Stock)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>रेती का स्टॉक और लेन-देन</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ बंद करें' : '+ बाहरी ट्रक से खरीद'}
        </button>
      </div>

      {/* Stock Summary */}
      <div className="stat-grid">
        <div className="card card-green">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📦 स्टॉक वैल्यू</p>
          <p style={{ fontSize: '2rem', fontWeight: 700 }}>{formatCurrency(data.stockValue)}</p>
          {data.stockQuantity > 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{data.stockQuantity} Tons</p>
          )}
        </div>
        <div className="card card-blue">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📥 कुल आने वाला (Total IN)</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(data.totalIn)}</p>
        </div>
        <div className="card card-red">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📤 कुल जाने वाला (Total OUT)</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(data.totalOut)}</p>
        </div>
      </div>

      {/* External Purchase Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📥 बाहरी ट्रक से रेती खरीदें</h3>
          <div className="form-grid">
            <div>
              <label className="label">तारीख (Date)</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">ट्रक नंबर</label>
              <input className="input" value={form.truckNumber} onChange={e => setForm(f => ({ ...f, truckNumber: e.target.value }))} placeholder="e.g., MP09XX1234" />
            </div>
            <div>
              <label className="label">खरीद कीमत (₹)</label>
              <input type="number" className="input" value={form.costValue || ''} onChange={e => setForm(f => ({ ...f, costValue: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">मात्रा (Tons)</label>
              <input type="number" className="input" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} placeholder="Optional" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">विवरण (Description)</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g., बाहरी गाड़ी से रेती ली" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '✅ स्टॉक में जोड़ें'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>रद्द करें</button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="label">महीना</label>
        <input type="month" className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 180 }} />
      </div>

      {/* Stock Ledger */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>तारीख</th>
              <th>IN / OUT</th>
              <th>स्रोत</th>
              <th>गाड़ी</th>
              <th>रकम (₹)</th>
              <th>मात्रा</th>
              <th>विवरण</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>कोई एंट्री नहीं मिली</td></tr>
            ) : data.entries.map(entry => (
              <tr key={entry._id}>
                <td>{formatDate(entry.date)}</td>
                <td>
                  <span className={`badge ${entry.type === 'in' ? 'badge-green' : 'badge-red'}`}>
                    {entry.type === 'in' ? '📥 IN' : '📤 OUT'}
                  </span>
                </td>
                <td>{sourceLabel(entry.source)}</td>
                <td>{entry.truckNumber || '-'}</td>
                <td>
                  <span className={entry.type === 'in' ? 'profit' : 'loss'}>
                    {entry.type === 'in' ? '+' : '-'} {formatCurrency(entry.costValue)}
                  </span>
                </td>
                <td>{entry.quantity > 0 ? `${entry.quantity} T` : '-'}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
