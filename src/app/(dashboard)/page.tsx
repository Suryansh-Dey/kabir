'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface DashboardData {
  today: {
    khadanProfit: number;
    khadanExpense: number;
    khadanTrips: number;
    localProfit: number;
    localExpense: number;
    localRevenue: number;
    localTrips: number;
    loaderIncome: number;
    loaderExpense: number;
    loaderProfit: number;
    totalProfit: number;
  };
  month: {
    khadanProfit: number;
    khadanExpense: number;
    khadanTrips: number;
    localProfit: number;
    localExpense: number;
    localRevenue: number;
    localTrips: number;
    loaderIncome: number;
    loaderExpense: number;
    loaderProfit: number;
    totalProfit: number;
    totalExpense: number;
  };
  stock: {
    value: number;
    totalIn: number;
    totalOut: number;
  };
  loans: {
    activeCount: number;
    monthlyEmi: number;
    totalRemaining: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!data) return <p>Error loading dashboard</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        📊 डैशबोर्ड (Dashboard)
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Today Summary */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
        📅 आज का हिसाब (Today)
      </h2>
      <div className="stat-grid">
        <StatCard
          title="कुल मुनाफा (Total Profit)"
          value={formatCurrency(data.today.totalProfit)}
          color={data.today.totalProfit >= 0 ? 'green' : 'red'}
          icon="💰"
        />
        <StatCard
          title="खदान गाड़ी मुनाफा"
          value={formatCurrency(data.today.khadanProfit)}
          subtitle={`${data.today.khadanTrips} trips`}
          color="blue"
          icon="🚚"
        />
        <StatCard
          title="लोकल गाड़ी मुनाफा"
          value={formatCurrency(data.today.localProfit)}
          subtitle={`${data.today.localTrips} trips`}
          color="blue"
          icon="🚛"
        />
        <StatCard
          title="लोडर मुनाफा"
          value={formatCurrency(data.today.loaderProfit)}
          color="blue"
          icon="🏗️"
        />
      </div>

      {/* Monthly Summary */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
        📆 इस महीने का हिसाब (This Month)
      </h2>
      <div className="stat-grid">
        <StatCard
          title="कुल मुनाफा (Total Profit)"
          value={formatCurrency(data.month.totalProfit)}
          color={data.month.totalProfit >= 0 ? 'green' : 'red'}
          icon="💰"
        />
        <StatCard
          title="कुल खर्चा (Total Expense)"
          value={formatCurrency(data.month.totalExpense)}
          color="red"
          icon="📤"
        />
        <StatCard
          title="खदान गाड़ी"
          value={formatCurrency(data.month.khadanProfit)}
          subtitle={`${data.month.khadanTrips} trips | खर्चा: ${formatCurrency(data.month.khadanExpense)}`}
          color="blue"
          icon="🚚"
        />
        <StatCard
          title="लोकल गाड़ी"
          value={formatCurrency(data.month.localProfit)}
          subtitle={`${data.month.localTrips} trips | बिक्री: ${formatCurrency(data.month.localRevenue)}`}
          color="blue"
          icon="🚛"
        />
        <StatCard
          title="लोडर"
          value={formatCurrency(data.month.loaderProfit)}
          subtitle={`आमदनी: ${formatCurrency(data.month.loaderIncome)}`}
          color="yellow"
          icon="🏗️"
        />
      </div>

      {/* Stock & Loans */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
        📦 स्टॉक और लोन (Stock & Loans)
      </h2>
      <div className="stat-grid">
        <StatCard
          title="स्टॉक वैल्यू (Stock Value)"
          value={formatCurrency(data.stock.value)}
          subtitle={`IN: ${formatCurrency(data.stock.totalIn)} | OUT: ${formatCurrency(data.stock.totalOut)}`}
          color="green"
          icon="📦"
        />
        <StatCard
          title="एक्टिव लोन (Active Loans)"
          value={String(data.loans.activeCount)}
          subtitle={`EMI: ${formatCurrency(data.loans.monthlyEmi)}/माह | बाकी: ${formatCurrency(data.loans.totalRemaining)}`}
          color="yellow"
          icon="💳"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, icon }: {
  title: string;
  value: string;
  subtitle?: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
  icon: string;
}) {
  return (
    <div className={`card card-${color}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{title}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{subtitle}</p>
          )}
        </div>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
    </div>
  );
}
