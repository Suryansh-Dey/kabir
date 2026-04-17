'use client';

import { useEffect, useState } from 'react';
import { ALL_TRUCKS } from '@/lib/constants';
import { formatCurrency, formatDate, getTodayDate } from '@/lib/utils';

interface Payment {
  _id: string;
  date: string;
  amount: number;
  note: string;
}

interface LoanType {
  _id: string;
  truckNumber: string;
  totalLoanAmount: number;
  emiAmount: number;
  emiDate: number;
  startDate: string;
  totalPaid: number;
  remainingAmount: number;
  isActive: boolean;
  payments: Payment[];
}

const emptyForm = {
  truckNumber: ALL_TRUCKS[0] as string,
  totalLoanAmount: 0,
  emiAmount: 0,
  emiDate: 1,
  startDate: getTodayDate(),
};

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [paymentForm, setPaymentForm] = useState({ loanId: '', amount: 0, note: '', date: getTodayDate() });
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);

  const fetchLoans = () => {
    fetch('/api/loans').then(r => r.json()).then(setLoans);
  };

  useEffect(() => { fetchLoans(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setForm({ ...emptyForm });
      setShowForm(false);
      fetchLoans();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (loanId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPayment: { date: paymentForm.date, amount: paymentForm.amount, note: paymentForm.note } }),
      });
      setShowPayment(null);
      setPaymentForm({ loanId: '', amount: 0, note: '', date: getTodayDate() });
      fetchLoans();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप वाकई इस लोन को हटाना चाहते हैं?')) return;
    await fetch(`/api/loans/${id}`, { method: 'DELETE' });
    fetchLoans();
  };

  const totalEmi = loans.filter(l => l.isActive).reduce((s, l) => s + l.emiAmount, 0);
  const totalRemaining = loans.filter(l => l.isActive).reduce((s, l) => s + l.remainingAmount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>💳 लोन / EMI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>गाड़ियों के लोन और किस्त का हिसाब</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ बंद करें' : '+ नया लोन'}
        </button>
      </div>

      {/* Summary */}
      <div className="stat-grid">
        <div className="card card-yellow">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>मासिक EMI</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalEmi)}</p>
        </div>
        <div className="card card-red">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>बाकी रकम</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(totalRemaining)}</p>
        </div>
        <div className="card card-blue">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>एक्टिव लोन</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loans.filter(l => l.isActive).length}</p>
        </div>
      </div>

      {/* New Loan Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card animate-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📝 नया लोन जोड़ें</h3>
          <div className="form-grid">
            <div>
              <label className="label">गाड़ी नंबर</label>
              <select className="select" value={form.truckNumber} onChange={e => setForm(f => ({ ...f, truckNumber: e.target.value }))}>
                {ALL_TRUCKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">कुल लोन रकम</label>
              <input type="number" className="input" value={form.totalLoanAmount || ''} onChange={e => setForm(f => ({ ...f, totalLoanAmount: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">EMI रकम (मासिक)</label>
              <input type="number" className="input" value={form.emiAmount || ''} onChange={e => setForm(f => ({ ...f, emiAmount: Number(e.target.value) }))} placeholder="₹" />
            </div>
            <div>
              <label className="label">EMI तारीख (दिन)</label>
              <input type="number" min={1} max={31} className="input" value={form.emiDate} onChange={e => setForm(f => ({ ...f, emiDate: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">शुरुआत तारीख</label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '✅ लोन सेव करें'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>रद्द करें</button>
          </div>
        </form>
      )}

      {/* Loans List */}
      {loans.map(loan => (
        <div key={loan._id} className={`card ${loan.isActive ? 'card-yellow' : ''}`} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-blue">{loan.truckNumber}</span>
                <span className={`badge ${loan.isActive ? 'badge-yellow' : 'badge-green'}`}>
                  {loan.isActive ? '🔴 Active' : '✅ Paid'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                कुल: {formatCurrency(loan.totalLoanAmount)} | EMI: {formatCurrency(loan.emiAmount)}/माह (तारीख: {loan.emiDate})
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                भरा: {formatCurrency(loan.totalPaid)} | बाकी: <span className="loss">{formatCurrency(loan.remainingAmount)}</span>
              </p>

              {/* Progress bar */}
              <div style={{ marginTop: '0.5rem', background: 'var(--bg-input)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (loan.totalPaid / loan.totalLoanAmount) * 100)}%`,
                  background: loan.isActive ? 'var(--yellow)' : 'var(--green)',
                  height: '100%',
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {Math.round((loan.totalPaid / loan.totalLoanAmount) * 100)}% paid
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {loan.isActive && (
                <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => { setShowPayment(loan._id); setPaymentForm(f => ({ ...f, loanId: loan._id, amount: loan.emiAmount })); }}>
                  💰 भुगतान करें
                </button>
              )}
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => setExpandedLoan(expandedLoan === loan._id ? null : loan._id)}>
                📋 इतिहास
              </button>
              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => handleDelete(loan._id)}>🗑️</button>
            </div>
          </div>

          {/* Payment Form */}
          {showPayment === loan._id && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-input)', borderRadius: 8 }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>💰 भुगतान दर्ज करें</h4>
              <div className="form-grid">
                <div>
                  <label className="label">रकम</label>
                  <input type="number" className="input" value={paymentForm.amount || ''} onChange={e => setPaymentForm(f => ({ ...f, amount: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">तारीख</label>
                  <input type="date" className="input" value={paymentForm.date} onChange={e => setPaymentForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="label">नोट</label>
                  <input className="input" value={paymentForm.note} onChange={e => setPaymentForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={() => handlePayment(loan._id)} disabled={loading}>
                  {loading ? <span className="spinner" /> : '✅ भुगतान सेव करें'}
                </button>
                <button className="btn btn-outline" onClick={() => setShowPayment(null)}>रद्द करें</button>
              </div>
            </div>
          )}

          {/* Payment History */}
          {expandedLoan === loan._id && loan.payments.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <table style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr><th>तारीख</th><th>रकम</th><th>नोट</th></tr>
                </thead>
                <tbody>
                  {loan.payments.map((p, i) => (
                    <tr key={i}>
                      <td>{formatDate(p.date)}</td>
                      <td className="profit">{formatCurrency(p.amount)}</td>
                      <td>{p.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {loans.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          कोई लोन नहीं मिला। ऊपर &quot;+ नया लोन&quot; बटन से जोड़ें।
        </div>
      )}
    </div>
  );
}
