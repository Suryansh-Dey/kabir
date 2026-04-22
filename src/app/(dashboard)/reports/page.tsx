'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';

interface TruckSummary {
  truckNumber: string;
  totalTrips: number;
  totalExpense: number;
  totalRevenue: number;
  totalProfit: number;
}

interface Summary {
  totalTrips: number;
  totalExpense: number;
  totalRevenue: number;
  totalProfit: number;
  totalDiesel: number;
  totalSalary: number;
  totalMaintenance: number;
  totalRoyalty?: number;
  directSales?: number;
  stockAdditions?: number;
  truckWise?: TruckSummary[];
}

export default function ReportsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [khadanSummary, setKhadanSummary] = useState<Summary | null>(null);
  const [localSummary, setLocalSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [kRes, lRes] = await Promise.all([
        fetch(`/api/khadan-trips/summary?month=${month}`),
        fetch(`/api/local-trips/summary?month=${month}`),
      ]);
      setKhadanSummary(await kRes.json());
      setLocalSummary(await lRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [month]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>📈 मासिक रिपोर्ट (Monthly Report)</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>महीने का पूरा हिसाब एक नज़र में</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label">महीना चुनें (Select Month)</label>
        <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 200 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Combined */}
          {khadanSummary && localSummary && (
            <div className="card card-green" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>📊 कुल मिलाकर (Combined)</h3>
              <div className="stat-grid" style={{ marginBottom: 0 }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>कुल मुनाफा</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700 }} className={
                    (khadanSummary.totalProfit + localSummary.totalProfit) >= 0 ? 'profit' : 'loss'
                  }>
                    {formatCurrency(khadanSummary.totalProfit + localSummary.totalProfit)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>कुल खर्चा</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--red)' }}>
                    {formatCurrency(khadanSummary.totalExpense + localSummary.totalExpense)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>कुल बिक्री</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--green)' }}>
                    {formatCurrency(khadanSummary.totalRevenue + localSummary.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>कुल ट्रिप्स</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {khadanSummary.totalTrips + localSummary.totalTrips}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Khadan Summary */}
          {khadanSummary && (
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚚 खदान गाड़ी रिपोर्ट</h3>
              <ReportTable data={[
                { label: 'कुल ट्रिप्स', value: String(khadanSummary.totalTrips) },
                { label: 'कुल खर्चा', value: formatCurrency(khadanSummary.totalExpense), type: 'expense' },
                { label: 'कुल बिक्री (डायरेक्ट)', value: formatCurrency(khadanSummary.totalRevenue), type: 'revenue' },
                { label: 'कुल मुनाफा', value: formatCurrency(khadanSummary.totalProfit), type: khadanSummary.totalProfit >= 0 ? 'profit' : 'loss' },
                { label: 'डीजल खर्चा', value: formatCurrency(khadanSummary.totalDiesel) },
                { label: 'सैलरी खर्चा', value: formatCurrency(khadanSummary.totalSalary) },
                { label: 'मरम्मत खर्चा', value: formatCurrency(khadanSummary.totalMaintenance) },
                { label: 'रॉयल्टी', value: formatCurrency(khadanSummary.totalRoyalty || 0) },
                { label: 'डायरेक्ट बिक्री', value: String(khadanSummary.directSales || 0) },
                { label: 'स्टॉक में जोड़ा', value: String(khadanSummary.stockAdditions || 0) },
              ]} />
            </div>
          )}

          {/* Local Summary */}
          {localSummary && (
            <div className="card">
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚛 लोकल गाड़ी रिपोर्ट</h3>
              <ReportTable data={[
                { label: 'कुल ट्रिप्स', value: String(localSummary.totalTrips) },
                { label: 'कुल खर्चा', value: formatCurrency(localSummary.totalExpense), type: 'expense' },
                { label: 'कुल बिक्री', value: formatCurrency(localSummary.totalRevenue), type: 'revenue' },
                { label: 'कुल मुनाफा', value: formatCurrency(localSummary.totalProfit), type: localSummary.totalProfit >= 0 ? 'profit' : 'loss' },
                { label: 'डीजल खर्चा', value: formatCurrency(localSummary.totalDiesel) },
                { label: 'सैलरी खर्चा', value: formatCurrency(localSummary.totalSalary) },
                { label: 'मरम्मत खर्चा', value: formatCurrency(localSummary.totalMaintenance) },
              ]} />
            </div>
          )}


          {khadanSummary && khadanSummary.truckWise && khadanSummary.truckWise.length > 0 && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚚 खदान गाड़ियाँ (Vehicle-wise Report)</h3>
              <VehicleReportTable data={khadanSummary.truckWise} />
            </div>
          )}

          {localSummary && localSummary.truckWise && localSummary.truckWise.length > 0 && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚛 लोकल गाड़ियाँ (Vehicle-wise Report)</h3>
              <VehicleReportTable data={localSummary.truckWise} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VehicleReportTable({ data }: { data: TruckSummary[] }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>गाड़ी नंबर</th>
            <th>ट्रिप्स</th>
            <th>खर्चा</th>
            <th>बिक्री</th>
            <th>मुनाफा</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td><span className="badge badge-blue">{row.truckNumber}</span></td>
              <td>{row.totalTrips}</td>
              <td className="loss">{formatCurrency(row.totalExpense)}</td>
              <td className="profit">{formatCurrency(row.totalRevenue)}</td>
              <td style={{ fontWeight: 'bold' }} className={row.totalProfit >= 0 ? 'profit' : 'loss'}>
                {row.totalProfit >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(row.totalProfit))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportTable({ data }: { data: { label: string; value: string; type?: string }[] }) {
  return (
    <table style={{ width: '100%' }}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td style={{ padding: '0.5rem 0', color: 'var(--text-secondary)' }}>{row.label}</td>
            <td style={{
              padding: '0.5rem 0',
              textAlign: 'right',
              fontWeight: 600,
              color: row.type === 'profit' ? 'var(--green)' :
                row.type === 'loss' ? 'var(--red)' :
                  row.type === 'revenue' ? 'var(--green)' :
                    row.type === 'expense' ? 'var(--red)' : 'var(--text-primary)',
            }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
