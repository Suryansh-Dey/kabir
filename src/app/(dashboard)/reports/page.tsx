'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, getCurrentMonth } from '@/lib/utils';

interface TruckSummary {
  truckNumber: string;
  totalTrips: number;
  totalExpense: number;
  totalRevenue: number;
  totalProfit: number;
  // Khadan-specific
  diesel?: number;
  salary?: number;
  maintenance?: number;
  royalty?: number;
  toll?: number;
  police?: number;
  panchayat?: number;
  loader?: number;
  otherExpenses?: number;
  directSales?: number;
  stockAdditions?: number;
  // Local-specific
  sandPurchase?: number;
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
  const [showTruckWise, setShowTruckWise] = useState(false);
  const [expandedTruck, setExpandedTruck] = useState<string | null>(null);

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

  const toggleTruck = (key: string) => {
    setExpandedTruck(expandedTruck === key ? null : key);
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>📈 मासिक रिपोर्ट (Monthly Report)</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>महीने का पूरा हिसाब एक नज़र में</p>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <label className="label">महीना चुनें (Select Month)</label>
          <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} style={{ width: 200 }} />
        </div>

        {/* Toggle Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>गाड़ी-वार रिपोर्ट</span>
          <button
            onClick={() => setShowTruckWise(!showTruckWise)}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: showTruckWise ? 'var(--green)' : 'var(--bg-input)',
              position: 'relative',
              transition: 'background 0.3s',
            }}
          >
            <span style={{
              position: 'absolute',
              top: 3,
              left: showTruckWise ? 27 : 3,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              transition: 'left 0.3s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>

          {/* Combined Summary — always at top */}
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

          {/* Overall Khadan Summary */}
          {!showTruckWise && khadanSummary && (
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

          {/* Overall Local Summary */}
          {!showTruckWise && localSummary && (
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

          {/* ===== VEHICLE-WISE SECTION (shown when toggle is ON) ===== */}
          {showTruckWise && (
            <>
              {/* Khadan Trucks Detail */}
              {khadanSummary?.truckWise && khadanSummary.truckWise.length > 0 && (
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚚 खदान गाड़ियाँ — गाड़ी-वार विवरण</h3>
                  {khadanSummary.truckWise.map(truck => {
                    const key = `khadan-${truck.truckNumber}`;
                    const isExpanded = expandedTruck === key;
                    return (
                      <div key={key} style={{ marginBottom: '0.75rem', border: '1px solid var(--bg-input)', borderRadius: 10, overflow: 'hidden' }}>
                        {/* Header row — always visible */}
                        <button
                          onClick={() => toggleTruck(key)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: isExpanded ? 'rgba(59,130,246,0.08)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="badge badge-blue">{truck.truckNumber}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{truck.totalTrips} trips</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={truck.totalProfit >= 0 ? 'profit' : 'loss'} style={{ fontWeight: 600 }}>
                              {truck.totalProfit >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(truck.totalProfit))}
                            </span>
                            <span style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '1.2rem' }}>▼</span>
                          </div>
                        </button>

                        {/* Detail panel */}
                        {isExpanded && (
                          <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid var(--bg-input)', animation: 'fadeIn 0.2s' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                              <DetailItem label="🛢️ डीजल" value={truck.diesel} />
                              <DetailItem label="💰 सैलरी" value={truck.salary} />
                              <DetailItem label="🔧 मरम्मत" value={truck.maintenance} />
                              <DetailItem label="📜 रॉयल्टी" value={truck.royalty} />
                              <DetailItem label="🛣️ टोल" value={truck.toll} />
                              <DetailItem label="👮 पुलिस" value={truck.police} />
                              <DetailItem label="🏘️ पंचायत" value={truck.panchayat} />
                              <DetailItem label="🏗️ लोडर" value={truck.loader} />
                              <DetailItem label="📦 अन्य खर्चा" value={truck.otherExpenses} />
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--bg-input)', flexWrap: 'wrap' }}>
                              <SummaryChip label="कुल खर्चा" value={truck.totalExpense} color="var(--red)" />
                              <SummaryChip label="बिक्री" value={truck.totalRevenue} color="var(--green)" />
                              <SummaryChip label="मुनाफा" value={truck.totalProfit} color={truck.totalProfit >= 0 ? 'var(--green)' : 'var(--red)'} />
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                डायरेक्ट: {truck.directSales || 0} | स्टॉक: {truck.stockAdditions || 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Local Trucks Detail */}
              {localSummary?.truckWise && localSummary.truckWise.length > 0 && (
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>🚛 लोकल गाड़ियाँ — गाड़ी-वार विवरण</h3>
                  {localSummary.truckWise.map(truck => {
                    const key = `local-${truck.truckNumber}`;
                    const isExpanded = expandedTruck === key;
                    return (
                      <div key={key} style={{ marginBottom: '0.75rem', border: '1px solid var(--bg-input)', borderRadius: 10, overflow: 'hidden' }}>
                        <button
                          onClick={() => toggleTruck(key)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            background: isExpanded ? 'rgba(59,130,246,0.08)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: '0.95rem',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="badge badge-blue">{truck.truckNumber}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{truck.totalTrips} trips</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={truck.totalProfit >= 0 ? 'profit' : 'loss'} style={{ fontWeight: 600 }}>
                              {truck.totalProfit >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(truck.totalProfit))}
                            </span>
                            <span style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '1.2rem' }}>▼</span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div style={{ padding: '0.75rem 1rem 1rem', borderTop: '1px solid var(--bg-input)', animation: 'fadeIn 0.2s' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
                              <DetailItem label="🛢️ डीजल" value={truck.diesel} />
                              <DetailItem label="💰 सैलरी" value={truck.salary} />
                              <DetailItem label="🔧 मरम्मत" value={truck.maintenance} />
                              <DetailItem label="🛣️ टोल" value={truck.toll} />
                              <DetailItem label="📦 रेती खरीद (स्टॉक से)" value={truck.sandPurchase} />
                              <DetailItem label="📦 अन्य खर्चा" value={truck.otherExpenses} />
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--bg-input)', flexWrap: 'wrap' }}>
                              <SummaryChip label="कुल खर्चा" value={truck.totalExpense} color="var(--red)" />
                              <SummaryChip label="बिक्री" value={truck.totalRevenue} color="var(--green)" />
                              <SummaryChip label="मुनाफा" value={truck.totalProfit} color={truck.totalProfit >= 0 ? 'var(--green)' : 'var(--red)'} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Small helper components ---------- */

function DetailItem({ label, value }: { label: string; value?: number }) {
  return (
    <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-input)', borderRadius: 8 }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{label}</p>
      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatCurrency(value || 0)}</p>
    </div>
  );
}

function SummaryChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '1.1rem', color }}>{formatCurrency(value)}</p>
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
