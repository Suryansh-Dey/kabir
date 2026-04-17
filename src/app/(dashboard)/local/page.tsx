'use client';

import { useEffect, useState } from 'react';
import { LOCAL_TRUCKS } from '@/lib/constants';
import { formatCurrency, formatDate, getTodayDate, getCurrentMonth } from '@/lib/utils';

interface LocalTrip {
  _id: string;
  truckNumber: string;
  date: string;
  driverName: string;
  dieselCost: number;
  sandPurchaseCost: number;
  driverSalary: number;
  maintenance: number;
  tollTax: number;
  otherExpenses: { label: string; amount: number }[];
  totalExpense: number;
  sellingPrice: number;
  customerName: string;
  numberOfTrips: number;
  quantity: number;
  profitLoss: number;
}

const emptyForm = {
  truckNumber: LOCAL_TRUCKS[0] as string,
  date: getTodayDate(),
  driverName: '',
  dieselCost: 0,
  sandPurchaseCost: 0,
  driverSalary: 0,
  maintenance: 0,
  tollTax: 0,
  otherExpenses: [] as { label: string; amount: number }[],
  sellingPrice: 0,
  customerName: '',
  numberOfTrips: 1,
  quantity: 0,
};

export default function LocalPage() {
  const [trips, setTrips] = useState<LocalTrip[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterTruck, setFilterTruck] = useState('');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [editId, setEditId] = useState<string | null>(null);
  const [newExpLabel, setNewExpLabel] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(0);

  const fetchTrips = () => {
    const params = new URLSearchParams();
    if (filterTruck) params.set('truck', filterTruck);
    if (filterMonth) params.set('month', filterMonth);
    fetch(`/api/local-trips?${params}`)
      .then(r => r.json())
      .then(setTrips);
  };

  useEffect(() => { fetchTrips(); }, [filterTruck, filterMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editId ? `/api/local-trips/${editId}` : '/api/local-trips';
      const method = editId ? 'PUT' : 'POST';
      await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ ...emptyForm });
      setEditId(null);
      setShowForm(false);
      fetchTrips();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: LocalTrip) => {
    setForm({
      truckNumber: trip.truckNumber,
      date: trip.date.split('T')[0],
      driverName: trip.driverName,
      dieselCost: trip.dieselCost,
      sandPurchaseCost: trip.sandPurchaseCost,
      driverSalary: trip.driverSalary,
      maintenance: trip.maintenance,
      tollTax: trip.tollTax,
      otherExpenses: trip.otherExpenses || [],
      sellingPrice: trip.sellingPrice,
      customerName: trip.customerName,
      numberOfTrips: trip.numberOfTrips,
      quantity: trip.quantity,
    });
    setEditId(trip._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप वाकई इसे हटाना चाहते हैं?')) return;
    await fetch(`/api/local-trips/${id}`, { method: 'DELETE' });
    fetchTrips();
  };

  const addOtherExpense = () => {
    if (!newExpLabel) return;
    setForm(f => ({ ...f, otherExpenses: [...f.otherExpenses, { label: newExpLabel, amount: newExpAmount }] }));
    setNewExpLabel('');
    setNewExpAmount(0);
  };

  const removeOtherExpense = (i: number) => {
    setForm(f => ({ ...f, otherExpenses: f.otherExpenses.filter((_, idx) => idx !== i) }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🚛 लोकल गाड़ी (Local Trucks)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>स्टॉक से रेती लेकर बेचने का हिसाब</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...emptyForm }); }}>
          {showForm ? '✕ बंद करें' : '+ नई एंट्री'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
            {editId ? '✏️ एंट्री एडिट करें' : '📝 नई एंट्री - लोकल गाड़ी'}
          </h3>

          <div className="form-grid">
            <div>
              <label className="label">गाड़ी नंबर (Truck)</label>
              <select className="select" value={form.truckNumber} onChange={e => setForm(f => ({ ...f, truckNumber: e.target.value }))}>
                {LOCAL_TRUCKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">तारीख (Date)</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">ड्राइवर का नाम</label>
              <input className="input" value={form.driverName} onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))} placeholder="Driver name" />
            </div>
          </div>

          <h4 style={{ fontWeight: 600, margin: '1.25rem 0 0.75rem', color: 'var(--text-secondary)' }}>📤 खर्चे (Expenses)</h4>
          <div className="form-grid">
            <div>
              <label className="label">डीजल (Diesel)</label>
              <input type="number" className="input" value={form.dieselCost || ''} onChange={e => setForm(f => ({ ...f, dieselCost: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">रेती खरीद (Stock से) ⚠️</label>
              <input type="number" className="input" value={form.sandPurchaseCost || ''} onChange={e => setForm(f => ({ ...f, sandPurchaseCost: Number(e.target.value) }))} placeholder="₹ - स्टॉक से कटेगा" />
            </div>
            <div>
              <label className="label">ड्राइवर सैलरी</label>
              <input type="number" className="input" value={form.driverSalary || ''} onChange={e => setForm(f => ({ ...f, driverSalary: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">मरम्मत (Maintenance)</label>
              <input type="number" className="input" value={form.maintenance || ''} onChange={e => setForm(f => ({ ...f, maintenance: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">टोल (Toll)</label>
              <input type="number" className="input" value={form.tollTax || ''} onChange={e => setForm(f => ({ ...f, tollTax: Number(e.target.value) }))} placeholder="₹" />
            </div>
          </div>

          {form.otherExpenses.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              {form.otherExpenses.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-blue">{e.label}: ₹{e.amount}</span>
                  <button type="button" onClick={() => removeOtherExpense(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <input className="input" value={newExpLabel} onChange={e => setNewExpLabel(e.target.value)} placeholder="अन्य खर्चा नाम" style={{ flex: 1, minWidth: 150 }} />
            <input type="number" className="input" value={newExpAmount || ''} onChange={e => setNewExpAmount(Number(e.target.value))} placeholder="₹" style={{ width: 120 }} />
            <button type="button" className="btn btn-outline" onClick={addOtherExpense}>+ जोड़ें</button>
          </div>

          <h4 style={{ fontWeight: 600, margin: '1.25rem 0 0.75rem', color: 'var(--text-secondary)' }}>📥 बिक्री (Revenue)</h4>
          <div className="form-grid">
            <div>
              <label className="label">बिक्री कीमत (Selling Price)</label>
              <input type="number" className="input" value={form.sellingPrice || ''} onChange={e => setForm(f => ({ ...f, sellingPrice: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">ग्राहक का नाम</label>
              <input className="input" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Customer name" />
            </div>
            <div>
              <label className="label">ट्रिप्स (Trips)</label>
              <input type="number" className="input" value={form.numberOfTrips || ''} onChange={e => setForm(f => ({ ...f, numberOfTrips: Number(e.target.value) }))} placeholder="1" />
            </div>
            <div>
              <label className="label">मात्रा (Quantity - tons)</label>
              <input type="number" className="input" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} placeholder="Optional" />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (editId ? '💾 अपडेट करें' : '✅ एंट्री सेव करें')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>रद्द करें</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label className="label">गाड़ी फ़िल्टर</label>
          <select className="select" value={filterTruck} onChange={e => setFilterTruck(e.target.value)} style={{ width: 180 }}>
            <option value="">सभी गाड़ियाँ</option>
            {LOCAL_TRUCKS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">महीना</label>
          <input type="month" className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 180 }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>तारीख</th>
              <th>गाड़ी</th>
              <th>ड्राइवर</th>
              <th>कुल खर्चा</th>
              <th>बिक्री</th>
              <th>ग्राहक</th>
              <th>मुनाफा/नुक्सान</th>
              <th>एक्शन</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>कोई एंट्री नहीं मिली</td></tr>
            ) : trips.map(trip => (
              <tr key={trip._id}>
                <td>{formatDate(trip.date)}</td>
                <td><span className="badge badge-blue">{trip.truckNumber}</span></td>
                <td>{trip.driverName || '-'}</td>
                <td>{formatCurrency(trip.totalExpense)}</td>
                <td>{formatCurrency(trip.sellingPrice)}</td>
                <td>{trip.customerName || '-'}</td>
                <td>
                  <span className={trip.profitLoss >= 0 ? 'profit' : 'loss'}>
                    {trip.profitLoss >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(trip.profitLoss))}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(trip)}>✏️</button>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDelete(trip._id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
