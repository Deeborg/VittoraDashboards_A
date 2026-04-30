import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemandForecasting.css';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, AreaChart, Area, ReferenceLine
} from 'recharts';

// ─── Static Data ─────────────────────────────────────────────────────────────

const inventoryComposition = [
  { name: 'Raw Materials',   val: 35, value: 2870000 },
  { name: 'WIP',             val: 25, value: 2050000 },
  { name: 'Finished Goods',  val: 40, value: 3280000 },
];
const COMP_COLORS = ['#6366f1', '#8b5cf6', '#10b981'];

const turnoverTrend = [
  { month: 'Q1', rate: 5.2, target: 6.5 },
  { month: 'Q2', rate: 5.8, target: 6.5 },
  { month: 'Q3', rate: 6.4, target: 6.5 },
  { month: 'Q4', rate: 6.8, target: 6.5 },
];

const agingData = [
  { bucket: '0–30d',  pct: 40, value: 3280000 },
  { bucket: '31–60d', pct: 30, value: 2460000 },
  { bucket: '61–90d', pct: 20, value: 1640000 },
  { bucket: '90+ d',  pct: 10, value: 820000  },
];

const skuAlerts = [
  { id: 'SKU-4401', name: 'Aluminum Casing',   cat: 'Finished Goods', qty: 320,  age: 112, val: '$12,400', status: 'Obsolete',  action: 'Clearance'   },
  { id: 'SKU-9921', name: 'Steel Rods',         cat: 'Raw Materials',  qty: 1800, age: 98,  val: '$8,200',  status: 'Slow-Move',  action: 'Reorder'     },
  { id: 'SKU-3310', name: 'Sensor Array',        cat: 'WIP',           qty: 55,   age: 74,  val: '$6,750',  status: 'Slow-Move',  action: 'Expedite'    },
  { id: 'SKU-7712', name: 'Polymer Resin',       cat: 'Raw Materials',  qty: 200,  age: 61,  val: '$3,100',  status: 'At Risk',    action: 'Monitor'     },
  { id: 'SKU-2204', name: 'Circuit Boards',      cat: 'Components',    qty: 80,   age: 44,  val: '$9,600',  status: 'Healthy',    action: 'None'        },
];

const abcData = [
  { class: 'A – Fast', items: 120, pctValue: 70, pctItems: 20 },
  { class: 'B – Mid',  items: 280, pctValue: 20, pctItems: 30 },
  { class: 'C – Slow', items: 600, pctValue: 10, pctItems: 50 },
];

const reorderItems = [
  { sku: 'SKU-1001', name: 'Steel Sheets',     currentStock: 230,  reorderPt: 500,  eoq: 1200, leadTime: '7d',  status: 'Below ROP'  },
  { sku: 'SKU-1042', name: 'Hydraulic Seals',  currentStock: 80,   reorderPt: 150,  eoq: 400,  leadTime: '5d',  status: 'Below ROP'  },
  { sku: 'SKU-2210', name: 'Drive Shafts',     currentStock: 12,   reorderPt: 25,   eoq: 60,   leadTime: '10d', status: 'Critical'   },
  { sku: 'SKU-3388', name: 'Polymer Resin',    currentStock: 410,  reorderPt: 400,  eoq: 800,  leadTime: '4d',  status: 'Near ROP'   },
  { sku: 'SKU-5501', name: 'Fastener Kit',     currentStock: 3200, reorderPt: 1000, eoq: 5000, leadTime: '3d',  status: 'Healthy'    },
];

const warehouseZones = [
  { zone: 'Zone A – Raw',      capacity: 5000, used: 3800, items: 142 },
  { zone: 'Zone B – WIP',      capacity: 3000, used: 2100, items: 87  },
  { zone: 'Zone C – Finished', capacity: 6000, used: 4900, items: 213 },
  { zone: 'Zone D – Returns',  capacity: 1000, used: 380,  items: 24  },
];

const monthlyMovement = [
  { month: 'Aug', inbound: 1800, outbound: 1650, returns: 40 },
  { month: 'Sep', inbound: 2100, outbound: 1980, returns: 55 },
  { month: 'Oct', inbound: 1950, outbound: 2100, returns: 30 },
  { month: 'Nov', inbound: 2300, outbound: 2050, returns: 60 },
  { month: 'Dec', inbound: 2600, outbound: 2400, returns: 80 },
  { month: 'Jan', inbound: 2200, outbound: 2350, returns: 45 },
];

const forecastAccuracy = [
  { month: 'Aug', actual: 1650, forecast: 1700 },
  { month: 'Sep', actual: 1980, forecast: 1900 },
  { month: 'Oct', actual: 2100, forecast: 2200 },
  { month: 'Nov', actual: 2050, forecast: 2000 },
  { month: 'Dec', actual: 2400, forecast: 2300 },
  { month: 'Jan', actual: 2350, forecast: 2400 },
];

const alerts = [
  { type: 'critical', msg: 'SKU-2210 (Drive Shafts) at critical level — 12 units left, 10d lead time',   time: '08:10 AM' },
  { type: 'critical', msg: 'SKU-1001 (Steel Sheets) below reorder point — trigger PO immediately',        time: '08:45 AM' },
  { type: 'warning',  msg: 'Zone C – Finished Goods at 82% capacity — risk of congestion',                time: '09:20 AM' },
  { type: 'warning',  msg: 'SKU-4401 (Aluminum Casing) 112 days old — initiate clearance process',       time: '09:55 AM' },
  { type: 'info',     msg: 'Inventory accuracy audit completed — 98.4% record accuracy achieved',         time: '10:30 AM' },
];
const ALERT_COLORS: Record<string, string> = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };

// ─── Sub-Components ──────────────────────────────────────────────────────────

const KPICard = ({
  title, value, trend, sub, positive
}: { title: string; value: string; trend: string; sub?: string; positive: boolean }) => (
  <div style={{
    background: '#ffffff', padding: '22px 24px', borderRadius: '16px',
    border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
      background: positive ? '#10b981' : '#ef4444', borderRadius: '16px 0 0 16px'
    }} />
    <div style={{ paddingLeft: '8px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.07em', marginBottom: '8px' }}>{title}</p>
      <h3 style={{ fontSize: '26px', margin: '0 0 4px', color: '#0f172a', fontWeight: 700, lineHeight: 1 }}>{value}</h3>
      <span style={{ fontSize: '12px', fontWeight: 600, color: positive ? '#10b981' : '#ef4444' }}>{trend}</span>
      {sub && <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{sub}</span>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    'Obsolete':   { bg: '#fee2e2', color: '#dc2626' },
    'Slow-Move':  { bg: '#fef3c7', color: '#b45309' },
    'At Risk':    { bg: '#ffedd5', color: '#c2410c' },
    'Healthy':    { bg: '#dcfce7', color: '#15803d' },
    'Critical':   { bg: '#fee2e2', color: '#dc2626' },
    'Below ROP':  { bg: '#fee2e2', color: '#dc2626' },
    'Near ROP':   { bg: '#fef3c7', color: '#b45309' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '99px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InventoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'reorder' | 'warehouse' | 'movement'>('overview');

  const kpiData = [
    { title: 'Total Inventory Value',   value: '$8.2M',  trend: '+2.4%',  sub: 'vs last month',   positive: false },
    { title: 'Inventory Turnover',      value: '6.4x',   trend: '+0.8x',  sub: 'target: 6.5x',    positive: true  },
    { title: 'Obsolete / Dead Stock',   value: '$120K',  trend: '-5.0%',  sub: 'improving',        positive: true  },
    { title: 'Stockout Risk Items',     value: '3 SKUs', trend: '+1',     sub: 'this week',         positive: false },
    { title: 'Inventory Accuracy',      value: '98.4%',  trend: '+0.6%',  sub: 'after audit',      positive: true  },
    { title: 'Days on Hand (Avg)',      value: '38 days',trend: '-3 days',sub: 'target: 35 days',  positive: true  },
  ];

  const tabs = [
    { key: 'overview',  label: '📊 Overview'           },
    { key: 'reorder',   label: '🔁 Reorder & EOQ'      },
    { key: 'warehouse', label: '🏭 Warehouse Capacity'  },
    { key: 'movement',  label: '📦 Stock Movement'      },
  ];

  return (
    <div className="demand-dashboard-container">

      {/* ── Header ── */}
      <div className="df-header">
        <button className="df-back-btn" onClick={() => navigate('/modules', {state: { scrollToModule: 'scm' }})}>← Back to SCM</button>
        <h1>Inventory Management</h1>
        <div className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>● SYSTEM OPTIMIZED</div>
      </div>

      {/* ── Alerts Strip ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#ffffff', border: `1px solid ${ALERT_COLORS[a.type]}33`,
            borderLeft: `4px solid ${ALERT_COLORS[a.type]}`,
            borderRadius: '10px', padding: '10px 16px', fontSize: '13px'
          }}>
            <span style={{ color: ALERT_COLORS[a.type], fontWeight: 700, minWidth: '60px', textTransform: 'capitalize' }}>{a.type}</span>
            <span style={{ flex: 1, color: '#334155' }}>{a.msg}</span>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{a.time}</span>
          </div>
        ))}
      </div>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {kpiData.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 16px', borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{
            padding: '10px 18px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
            borderRadius: '10px 10px 0 0', transition: 'all 0.2s',
            background: activeTab === t.key ? '#3b82f6' : 'transparent',
            color: activeTab === t.key ? '#ffffff' : '#64748b',
            borderBottom: activeTab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: '-2px'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Row 1: Composition + Turnover + Aging */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* Stock Composition */}
            <div className="chart-card">
              <h3 className="chart-title">Stock Composition</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={inventoryComposition} innerRadius={50} outerRadius={72} dataKey="val" paddingAngle={3}>
                    {inventoryComposition.map((_, i) => <Cell key={i} fill={COMP_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string, props: any) => [`${v}% — $${(props.payload.value / 1000000).toFixed(2)}M`, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '8px' }}>
                {inventoryComposition.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: COMP_COLORS[i], fontWeight: 600 }}>● {d.name}</span>
                    <span style={{ color: '#334155', fontWeight: 700 }}>{d.val}% — ${(d.value / 1000000).toFixed(2)}M</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Turnover Velocity */}
            <div className="chart-card">
              <h3 className="chart-title">Inventory Turnover vs Target</h3>
              <div style={{ height: '230px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={turnoverTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis domain={[4, 8]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" name="Turnover Rate" fill="#6366f1" radius={[4,4,0,0]} />
                    <Line dataKey="target" name="Target (6.5x)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Aging Distribution */}
            <div className="chart-card">
              <h3 className="chart-title">Stock Aging Distribution</h3>
              <div style={{ height: '180px' }}>
                <ResponsiveContainer>
                  <BarChart data={agingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" />
                    <Tooltip formatter={(v: number, _: any, props: any) => [`${v}% — $${(props.payload.value / 1000).toFixed(0)}K`]} />
                    <Bar dataKey="pct" name="% of Stock" radius={[4,4,0,0]}>
                      {agingData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : i === 2 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '8px', padding: '8px 10px', background: '#fef2f2', borderRadius: '8px', fontSize: '11px', color: '#991b1b' }}>
                ⚠ $820K of stock is 90+ days old — review for write-off or clearance
              </div>
            </div>
          </div>

          {/* Row 2: ABC Analysis + SKU Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', marginBottom: '20px' }}>

            {/* ABC Analysis */}
            <div className="chart-card">
              <h3 className="chart-title">ABC Inventory Classification</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Pareto-based prioritization for replenishment & control</p>
              {abcData.map((d, i) => {
                const colors = ['#10b981', '#3b82f6', '#f59e0b'];
                return (
                  <div key={d.class} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 700, color: colors[i] }}>{d.class}</span>
                      <span style={{ color: '#64748b' }}>{d.items} SKUs · <strong>{d.pctValue}%</strong> of value</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${d.pctValue}%`, background: colors[i], height: '8px', borderRadius: '4px' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0' }}>{d.pctItems}% of total SKU count</p>
                  </div>
                );
              })}
              <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '8px', fontSize: '12px', color: '#1d4ed8', marginTop: '8px' }}>
                💡 Focus 80% of replenishment effort on Class A (120 SKUs) for maximum cash efficiency.
              </div>
            </div>

            {/* SKU Alerts Table */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="chart-title" style={{ margin: 0 }}>Critical SKU Aging Alerts</h3>
                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>View All SKUs →</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['SKU ID', 'Item', 'Category', 'Qty', 'Age', 'Value', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 10px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skuAlerts.map(row => (
                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 10px', fontWeight: 700, color: '#6366f1' }}>{row.id}</td>
                      <td style={{ color: '#334155' }}>{row.name}</td>
                      <td style={{ color: '#64748b', fontSize: '12px' }}>{row.cat}</td>
                      <td style={{ color: '#334155' }}>{row.qty.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: row.age > 90 ? '#dc2626' : row.age > 60 ? '#f59e0b' : '#64748b' }}>{row.age}d</td>
                      <td style={{ color: '#334155' }}>{row.val}</td>
                      <td><StatusBadge status={row.status} /></td>
                      <td>
                        <span style={{
                          fontSize: '11px', padding: '3px 10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                          background: row.action === 'None' ? '#f1f5f9' : '#eff6ff', color: row.action === 'None' ? '#94a3b8' : '#1d4ed8',
                          border: '1px solid #bfdbfe'
                        }}>{row.action}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ REORDER & EOQ TAB ══════════════ */}
      {activeTab === 'reorder' && (
        <>
          <div className="chart-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="chart-title" style={{ margin: 0 }}>Reorder Point & EOQ Tracker</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>2 Critical</span>
                <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>2 Below ROP</span>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['SKU', 'Item', 'Current Stock', 'Reorder Point', 'EOQ', 'Lead Time', 'Stock Level', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 12px', textAlign: 'left', color: '#64748b', fontWeight: 700, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reorderItems.map(row => {
                  const pct = Math.min((row.currentStock / (row.reorderPt * 2)) * 100, 100);
                  const barColor = row.status === 'Critical' ? '#ef4444' : row.status === 'Below ROP' ? '#f59e0b' : row.status === 'Near ROP' ? '#f59e0b' : '#10b981';
                  return (
                    <tr key={row.sku} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 12px', fontWeight: 700, color: '#6366f1' }}>{row.sku}</td>
                      <td style={{ color: '#334155' }}>{row.name}</td>
                      <td style={{ fontWeight: 700, color: row.currentStock < row.reorderPt ? '#ef4444' : '#334155' }}>{row.currentStock.toLocaleString()}</td>
                      <td style={{ color: '#64748b' }}>{row.reorderPt.toLocaleString()}</td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>{row.eoq.toLocaleString()}</td>
                      <td style={{ color: '#64748b' }}>{row.leadTime}</td>
                      <td style={{ minWidth: '100px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                            <div style={{ width: `${pct}%`, background: barColor, height: '6px', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{Math.round(pct)}%</span>
                        </div>
                      </td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'SKUs Below Reorder Point', val: '3',    color: '#ef4444', note: 'Immediate action needed'   },
              { label: 'Avg Days of Supply',        val: '38d',  color: '#3b82f6', note: 'Across all active SKUs'   },
              { label: 'Suggested POs to Raise',    val: '4',    color: '#f59e0b', note: 'Based on ROP & lead time' },
              { label: 'Potential Stockout Value',  val: '$31K', color: '#dc2626', note: 'If no action taken'       },
            ].map(m => (
              <div key={m.label} style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</p>
                <p style={{ fontSize: '26px', fontWeight: 700, color: m.color, margin: '0 0 4px' }}>{m.val}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{m.note}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════ WAREHOUSE CAPACITY TAB ══════════════ */}
      {activeTab === 'warehouse' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Warehouse Zone Capacity Utilization</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={warehouseZones} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="zone" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="capacity" name="Max Capacity" fill="#e2e8f0" radius={[0,4,4,0]} />
                    <Bar dataKey="used"     name="Used"         radius={[0,4,4,0]}>
                      {warehouseZones.map((w, i) => {
                        const pct = (w.used / w.capacity) * 100;
                        return <Cell key={i} fill={pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981'} />;
                      })}
                    </Bar>
                    <ReferenceLine x={0} stroke="#000" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Zone Summary</h3>
              {warehouseZones.map(z => {
                const pct = Math.round((z.used / z.capacity) * 100);
                const color = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981';
                return (
                  <div key={z.zone} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{z.zone}</span>
                      <span style={{ fontWeight: 700, color }}>{pct}% full · {z.items} items</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px' }}>
                      <div style={{ width: `${pct}%`, background: color, height: '8px', borderRadius: '4px' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '3px 0 0' }}>
                      {z.used.toLocaleString()} / {z.capacity.toLocaleString()} units
                    </p>
                  </div>
                );
              })}
              <div style={{ padding: '10px 12px', background: '#fef2f2', borderRadius: '8px', fontSize: '12px', color: '#991b1b', marginTop: '8px' }}>
                ⚠ Zone C at 82% — plan overflow or expedite outbound shipments.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Total Warehouse Capacity', val: '15,000',  note: 'Storage units across all zones', color: '#3b82f6' },
              { label: 'Total Used',                val: '11,180',  note: '74.5% overall utilization',      color: '#6366f1' },
              { label: 'Available Space',           val: '3,820',   note: 'Units available for intake',     color: '#10b981' },
              { label: 'Zones Near Full',           val: '1 Zone',  note: 'Zone C at 82% capacity',         color: '#f59e0b' },
            ].map(m => (
              <div key={m.label} style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: m.color, margin: '0 0 4px' }}>{m.val}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{m.note}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════ STOCK MOVEMENT TAB ══════════════ */}
      {activeTab === 'movement' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card">
              <h3 className="chart-title">Monthly Stock Movement — Inbound vs Outbound vs Returns</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <ComposedChart data={monthlyMovement}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="inbound"  name="Inbound"  fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="outbound" name="Outbound" fill="#10b981" radius={[4,4,0,0]} />
                    <Line dataKey="returns" name="Returns"  stroke="#ef4444" strokeWidth={2} dot />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Forecast vs Actual Outbound</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer>
                  <AreaChart data={forecastAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="forecast" name="Forecast"     stroke="#f59e0b" fill="#fffbeb" strokeWidth={2} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="actual"   name="Actual Units" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { label: 'Avg Daily Outbound',   val: '78 units', color: '#10b981', note: 'Last 30 days'              },
              { label: 'Return Rate (MTD)',     val: '2.1%',     color: '#ef4444', note: 'Target: <1.5%'            },
              { label: 'Forecast Accuracy',    val: '94.2%',    color: '#3b82f6', note: 'Outbound vs forecast'      },
              { label: 'Inventory Build-up',   val: '+$380K',   color: '#f59e0b', note: 'Inbound > Outbound in Jan' },
            ].map(m => (
              <div key={m.label} style={{ background: '#ffffff', borderRadius: '14px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{m.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: m.color, margin: '0 0 4px' }}>{m.val}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{m.note}</p>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default InventoryManagement;