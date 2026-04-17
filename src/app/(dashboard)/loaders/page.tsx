'use client';

import { useEffect, useState } from 'react';
import { LOADERS } from '@/lib/constants';
import { formatCurrency, formatDate, getTodayDate, getCurrentMonth } from '@/lib/utils';

interface LoaderEntry {
  _id: string;
  loaderNumber: string;
  date: string;
  trucksLoaded: number;
  ratePerLoading: number;
  externalIncome: number;
  totalIncome: number;
  dieselCost: number;
  maintenance: number;
  operatorSalary: number;
  otherExpenses: { label: string; amount: number }[];
  totalExpense: number;
  profitLoss: number;
}

const emptyForm = {
  loaderNumber: LOADERS[0] as string,
  date: getTodayDate(),
  trucksLoaded: 0,
  ratePerLoading: 0,
  externalIncome: 0,
  dieselCost: 0,
  maintenance: 0,
  operatorSalary: 0,
  otherExpenses: [] as { label: string; amount: number }[],
};

export default function LoadersPage() {
  const [entries, setEntries] = useState<LoaderEntry[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterLoader, setFilterLoader] = useState('');
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [editId, setEditId] = useState<string | null>(null);
  const [newExpLabel, setNewExpLabel] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(0);

  const fetchEntries = () => {
    const params = new URLSearchParams();
    if (filterLoader) params.set('loader', filterLoader);
    if (filterMonth) params.set('month', filterMonth);
    fetch(`/api/loader-entries?${params}`)
      .then(r => r.json())
      .then(setEntries);
  };

  useEffect(() => { fetchEntries(); }, [filterLoader, filterMonth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editId ? `/api/loader-entries/${editId}` : '/api/loader-entries';
      const method = editId ? 'PUT' : 'POST';
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setForm({ ...emptyForm });
      setEditId(null);
      setShowForm(false);
      fetchEntries();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: LoaderEntry) => {
    setForm({
      loaderNumber: entry.loaderNumber,
      date: entry.date.split('T')[0],
      trucksLoaded: entry.trucksLoaded,
      ratePerLoading: entry.ratePerLoading,
      externalIncome: entry.externalIncome,
      dieselCost: entry.dieselCost,
      maintenance: entry.maintenance,
      operatorSalary: entry.operatorSalary,
      otherExpenses: entry.otherExpenses || [],
    });
    setEditId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप वाकई इसे हटाना चाहते हैं?')) return;
    await fetch(`/api/loader-entries/${id}`, { method: 'DELETE' });
    fetchEntries();
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

  const calcIncome = () => (form.trucksLoaded * form.ratePerLoading) + form.externalIncome;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🏗️ लोडर (Loaders)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>लोडर ट्रैक्टर का हिसाब</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...emptyForm }); }}>
          {showForm ? '✕ बंद करें' : '+ नई एंट्री'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>
            {editId ? '✏️ एंट्री एडिट करें' : '📝 नई एंट्री - लोडर'}
          </h3>

          <div className="form-grid">
            <div>
              <label className="label">लोडर नंबर</label>
              <select className="select" value={form.loaderNumber} onChange={e => setForm(f => ({ ...f, loaderNumber: e.target.value }))}>
                {LOADERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">तारीख (Date)</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <h4 style={{ fontWeight: 600, margin: '1.25rem 0 0.75rem', color: 'var(--text-secondary)' }}>📥 आमदनी (Income)</h4>
          <div className="form-grid">
            <div>
              <label className="label">कितने ट्रक लोड किए</label>
              <input type="number" className="input" value={form.trucksLoaded || ''} onChange={e => setForm(f => ({ ...f, trucksLoaded: Number(e.target.value) }))} placeholder="0" />
            </div>
            <div>
              <label className="label">प्रति लोडिंग रेट (₹)</label>
              <input type="number" className="input" value={form.ratePerLoading || ''} onChange={e => setForm(f => ({ ...f, ratePerLoading: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">बाहरी आमदनी (External)</label>
              <input type="number" className="input" value={form.externalIncome || ''} onChange={e => setForm(f => ({ ...f, externalIncome: Number(e.target.value) }))} placeholder="₹" />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: 8, color: 'var(--green)' }}>
            कुल आमदनी: {formatCurrency(calcIncome())}
          </div>

          <h4 style={{ fontWeight: 600, margin: '1.25rem 0 0.75rem', color: 'var(--text-secondary)' }}>📤 खर्चे (Expenses)</h4>
          <div className="form-grid">
            <div>
              <label className="label">डीजल (Diesel)</label>
              <input type="number" className="input" value={form.dieselCost || ''} onChange={e => setForm(f => ({ ...f, dieselCost: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">मरम्मत (Maintenance)</label>
              <input type="number" className="input" value={form.maintenance || ''} onChange={e => setForm(f => ({ ...f, maintenance: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">ऑपरेटर सैलरी</label>
              <input type="number" className="input" value={form.operatorSalary || ''} onChange={e => setForm(f => ({ ...f, operatorSalary: Number(e.target.value) }))} placeholder="₹" />
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
          <label className="label">लोडर फ़िल्टर</label>
          <select className="select" value={filterLoader} onChange={e => setFilterLoader(e.target.value)} style={{ width: 180 }}>
            <option value="">सभी लोडर</option>
            {LOADERS.map(t => <option key={t} value={t}>{t}</option>)}
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
              <th>लोडर</th>
              <th>ट्रक लोड</th>
              <th>आमदनी</th>
              <th>खर्चा</th>
              <th>मुनाफा</th>
              <th>एक्शन</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>कोई एंट्री नहीं मिली</td></tr>
            ) : entries.map(entry => (
              <tr key={entry._id}>
                <td>{formatDate(entry.date)}</td>
                <td><span className="badge badge-yellow">{entry.loaderNumber}</span></td>
                <td>{entry.trucksLoaded} × ₹{entry.ratePerLoading}</td>
                <td className="profit">{formatCurrency(entry.totalIncome)}</td>
                <td>{formatCurrency(entry.totalExpense)}</td>
                <td>
                  <span className={entry.profitLoss >= 0 ? 'profit' : 'loss'}>
                    {entry.profitLoss >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(entry.profitLoss))}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleEdit(entry)}>✏️</button>
                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDelete(entry._id)}>🗑️</button>
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
